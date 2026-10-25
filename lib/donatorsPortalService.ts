'use client';

import { UserRole, canManageDonations } from '@/lib/rbac';

export type DonationFrequency = 'monthly' | 'quarterly' | 'yearly';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'submitted_for_verification'
  | 'verified'
  | 'rejected'
  | 'cancelled'
  | 'refunded';

export type MobileVerificationStatus =
  | 'verified'
  | 'pending_admin_verification'
  | 'unverified';

export type MemberCategory =
  | 'individual'
  | 'youth_student'
  | 'patron'
  | 'alumni_supporter'
  | 'institutional';

export interface VerifiedContactMetadata {
  mobileNumber: string;
  isVerified: boolean;
  verificationStatus: MobileVerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationMethod?: 'sms_otp_provider' | 'admin_verified' | 'pending_provider';
  lastConfirmationRequestedAt?: string;
  otpAttemptsCount?: number;
  otpLockedUntil?: string;
}

export interface MemberProfileRecord {
  uid: string;
  memberId: string;
  // Preserved authentication identity (separate from editable fields)
  authEmail: string;
  authPhone?: string;

  // Step 1 — Personal Information
  fullName: string;
  profilePhotograph: string;
  dob: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  occupation: string;
  email: string;
  primaryMobile: string;
  alternateMobile?: string;

  // Step 2 — Address Information
  houseAndStreet: string;
  villageTownCity: string;
  postOffice: string;
  policeStation?: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;

  // Step 3 — Membership Information
  membershipRegistrationDate: string;
  memberCategory: MemberCategory;
  areasOfInterest: string[];
  preferredCommunicationMethod: 'email' | 'sms' | 'whatsapp' | 'phone';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Step 4 — Declaration & Consent
  accuracyConfirmed: boolean;
  dataProcessingConsent: boolean;
  promotionalUpdatesConsent: boolean; // Optional - not compulsory for donations

  // Profile Completion & Draft Tracking
  profileCompletionStatus: 'incomplete' | 'draft' | 'complete';
  completionPercentage: number;
  currentWizardStep: 1 | 2 | 3 | 4;
  verifiedContactMetadata: VerifiedContactMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface DonationPlanRecord {
  planId: string;
  uid: string;
  memberId: string;
  donorName: string;
  amount: number;
  frequency: DonationFrequency;
  purpose: string;
  startDate: string;
  nextSuggestedPaymentDate: string;
  status: 'active' | 'paused' | 'cancelled';
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonationRecordItem {
  donationId: string; // Unique Donation Reference e.g. MADEN-DON-2026-104829
  uid: string;
  memberId: string;
  donorName: string;
  donorEmail: string;
  donorAddress: string;
  donorMobile: string;
  planId?: string;
  invoiceNumber: string; // e.g. MADEN-INV-2026-000101
  receiptNumber?: string; // e.g. MADEN-RCP-2026-000101 (Issued ONLY when verified)
  reversalDocumentNumber?: string; // e.g. MADEN-REV-2026-000101 (Issued if refunded/reversed)
  amount: number;
  amountInWords: string;
  currency: 'INR';
  frequency: DonationFrequency;
  purpose: string;
  paymentMethod: 'official_qr_upi';
  transactionReference?: string;
  paymentDate?: string;
  paymentStatus: PaymentStatus;
  mobileVerificationStatus: MobileVerificationStatus;
  rejectionReason?: string;
  reversalReason?: string;
  reversedAt?: string;
  reversedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSubmissionRecord {
  submissionId: string;
  donationId: string;
  uid: string;
  memberId: string;
  donorName: string;
  registeredMobile: string;
  transactionReference: string;
  submittedAmount: number;
  paymentDate: string;
  evidenceFileReference?: string;
  declarationAccepted: boolean;
  verificationStatus: 'submitted_for_verification' | 'verified' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DonatorsPortalModuleConfig {
  moduleEnabled: boolean;
  portalHeadline: string;
  portalSubheadline: string;
  portalAnnouncementBanner: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  donationPurposes: string[];
  interestAreas: string[];
}

export interface OrganizationPaymentSettings {
  officialQrCodeUrl: string;
  officialQrCodeStoragePath: string;
  activeStatus: boolean;
  paymentInstructions: string[];
  presetAmounts: number[];
  minCustomAmount: number;
  maxCustomAmount: number;
  allowedFrequencies: DonationFrequency[];
  invoicePrefix: string;
  receiptPrefix: string;
  reversalPrefix: string;
  nextInvoiceSequence: number;
  nextReceiptSequence: number;
  nextReversalSequence: number;
  smsOtpProviderConfigured: boolean;
  smsOtpProviderName: string;
  organizationDisplayDetails: {
    legalName: string;
    brandName: string;
    registeredAddress: string;
    officialEmail: string;
    officialPhone: string;
    website: string;
    registrationNumber: string;
    panNumber: string;
    tax80gVerified: boolean;
    tax80gRegistrationNumber: string;
    authorizedSignatoryName: string;
    authorizedSignatoryTitle: string;
  };
  portalModuleConfig: DonatorsPortalModuleConfig;
  updatedBy: string;
  updatedAt: string;
}

export interface DonorPortalNotification {
  id: string;
  uid: string;
  memberId: string;
  title: string;
  message: string;
  category: 'payment' | 'receipt' | 'plan_reminder' | 'profile' | 'mobile_verification';
  isRead: boolean;
  createdAt: string;
  relatedDonationId?: string;
}

export interface AdminAuditLogEntry {
  logId: string;
  actorUid: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: 'donation' | 'submission' | 'member_profile' | 'payment_settings' | 'refund_reversal';
  targetId: string;
  details: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  MEMBER_PROFILES: 'maden_faf_donor_member_profiles_v1',
  DONATION_PLANS: 'maden_faf_donor_plans_v1',
  DONATIONS: 'maden_faf_donations_ledger_v1',
  PAYMENT_SUBMISSIONS: 'maden_faf_payment_submissions_v1',
  ORG_PAYMENT_SETTINGS: 'maden_faf_org_payment_settings_v1',
  NOTIFICATIONS: 'maden_faf_donor_notifications_v1',
  AUDIT_LOGS: 'maden_faf_donor_admin_audit_logs_v1',
};

export const DEFAULT_ORG_PAYMENT_SETTINGS: OrganizationPaymentSettings = {
  officialQrCodeUrl: '',
  officialQrCodeStoragePath: 'organizationPaymentSettings/official-qr-code',
  activeStatus: true,
  paymentInstructions: [
    'Scan the official MADEN Football Academy Foundation QR code above using any BHIM UPI, Google Pay, PhonePe, Paytm, or mobile banking app.',
    'Verify that the payee name displayed in your UPI app matches "MADEN Football Academy Foundation".',
    'Enter the exact contribution amount shown on your invoice instruction.',
    'After completing the transfer in your UPI app, copy the 12-digit UPI Reference / UTR number and submit it in the Payment Confirmation form below.',
    'Note: QR-based payments are manual contributions. Selecting a Monthly, Quarterly, or Yearly plan registers a contribution commitment schedule and reminder — it does NOT set up an automatic debit mandate.',
  ],
  presetAmounts: [500, 1000, 2500, 5000, 10000],
  minCustomAmount: 100,
  maxCustomAmount: 500000,
  allowedFrequencies: ['monthly', 'quarterly', 'yearly'],
  invoicePrefix: 'MADEN-INV',
  receiptPrefix: 'MADEN-RCP',
  reversalPrefix: 'MADEN-REV',
  nextInvoiceSequence: 1001,
  nextReceiptSequence: 1001,
  nextReversalSequence: 1001,
  smsOtpProviderConfigured: Boolean(process.env.NEXT_PUBLIC_SMS_OTP_ENABLED === 'true'),
  smsOtpProviderName: process.env.NEXT_PUBLIC_SMS_OTP_PROVIDER || 'Not Configured (Admin Verification Workflow Active)',
  organizationDisplayDetails: {
    legalName: 'MADEN Football Academy Foundation',
    brandName: 'MADEN FAF',
    registeredAddress: 'Central Ground Complex, Gayeshpur, Kalyani, Nadia District, West Bengal – 741234, India',
    officialEmail: 'foundation@madenfaf.in',
    officialPhone: '+91 98302 45891',
    website: 'https://www.madenfaf.in',
    registrationNumber: 'WB-NAD-FAF-2023-SECTION8',
    panNumber: '',
    tax80gVerified: false, // Never claim 80G tax deduction unless verified and explicitly configured by Admin
    tax80gRegistrationNumber: '',
    authorizedSignatoryName: 'Technical & Foundation Directorate',
    authorizedSignatoryTitle: 'Authorized Signatory, MADEN Football Academy Foundation',
  },
  portalModuleConfig: {
    moduleEnabled: true,
    portalHeadline: 'Foundation Supporter & Donators Portal',
    portalSubheadline:
      'Official MADEN FAF Member contribution management, verified QR donations, recurring commitments, and statutory receipts.',
    portalAnnouncementBanner:
      'All contributions directly fund grassroots youth training, underprivileged player scholarships, and campus equipment across West Bengal.',
    primaryCtaLabel: 'Visit Our Academy',
    secondaryCtaLabel: 'See Your Digital Profile',
    donationPurposes: [
      'Grassroots Youth Training & Player Scholarships',
      'Underprivileged Player Scholarships (Full Merit & Need-Based)',
      'Girls & Women Football Development Grant',
      'Sports Nutrition, Physiotherapy & Medical Welfare',
      'Campus Turf Infrastructure & Training Equipment',
      'Regional Youth Tournament & Exposure Travel',
    ],
    interestAreas: [
      'Grassroots Youth Training (U-6 to U-12)',
      'Underprivileged Player Scholarships',
      'Girls & Women Football Development',
      'Sports Nutrition & Medical Welfare',
      'Campus Infrastructure & Turf Equipment',
      'Youth Tournament & Exposure Travel',
    ],
  },
  updatedBy: 'system-bootstrap',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// Initial seed profile for existing test member 'member@madenfaf.com' (usr-member-01)
const INITIAL_MEMBER_PROFILES: MemberProfileRecord[] = [
  {
    uid: 'usr-member-01',
    memberId: 'MADEN-MEM-2026-100101',
    authEmail: 'member@madenfaf.com',
    fullName: 'Sourav Chatterjee',
    profilePhotograph: '',
    dob: '1990-08-14',
    gender: 'male',
    occupation: 'Civil Engineer & Grassroots Football Supporter',
    email: 'member@madenfaf.com',
    primaryMobile: '9830112233',
    alternateMobile: '9830112234',
    houseAndStreet: 'Plot 42, B-Block Main Road',
    villageTownCity: 'Kalyani',
    postOffice: 'Kalyani Head Post Office',
    policeStation: 'Kalyani PS',
    district: 'Nadia',
    state: 'West Bengal',
    pinCode: '741235',
    country: 'India',
    membershipRegistrationDate: '2026-01-10',
    memberCategory: 'individual',
    areasOfInterest: ['Grassroots Youth Training', 'Underprivileged Player Scholarships', 'Girls Football Development'],
    preferredCommunicationMethod: 'email',
    emergencyContact: {
      name: 'Rina Chatterjee',
      relationship: 'Spouse',
      phone: '9830112299',
    },
    accuracyConfirmed: true,
    dataProcessingConsent: true,
    promotionalUpdatesConsent: true,
    profileCompletionStatus: 'complete',
    completionPercentage: 100,
    currentWizardStep: 4,
    verifiedContactMetadata: {
      mobileNumber: '9830112233',
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: '2026-01-10T10:15:00.000Z',
      verifiedBy: 'admin@madenfaf.com',
      verificationMethod: 'admin_verified',
    },
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T10:15:00.000Z',
  },
];

// Convert integer amount in INR to Indian English words
export function numberToIndianRupeeWords(amount: number): string {
  const cleanAmount = Math.round(Math.abs(amount));
  if (cleanAmount === 0) return 'Zero Rupees Only';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `${tens[t]}${o > 0 ? ' ' + ones[o] : ''}`;
  }

  function convertNumber(n: number): string {
    const parts: string[] = [];
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;

    if (crore > 0) parts.push(`${convertTwoDigits(crore)} Crore`);
    if (lakh > 0) parts.push(`${convertTwoDigits(lakh)} Lakh`);
    if (thousand > 0) parts.push(`${convertTwoDigits(thousand)} Thousand`);
    if (hundred > 0) parts.push(`${ones[hundred]} Hundred`);
    if (remainder > 0) {
      if (parts.length > 0) parts.push(`and ${convertTwoDigits(remainder)}`);
      else parts.push(convertTwoDigits(remainder));
    }
    return parts.join(' ');
  }

  return `Indian Rupees ${convertNumber(cleanAmount)} Only`;
}

// Validate 10-digit Indian mobile number
export function isValidIndianMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, '').replace(/^91/, '');
  return /^[6-9]\d{9}$/.test(digits);
}

export function normalizeIndianMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  return digits.slice(-10);
}

export function maskIndianMobile(mobile: string): string {
  const norm = normalizeIndianMobile(mobile);
  if (norm.length !== 10) return mobile || 'Not Provided';
  return `+91 ${norm.slice(0, 2)}••• •${norm.slice(6)}`;
}

export function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidIndianPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

export function calculateNextSuggestedDate(startDateIso: string, frequency: DonationFrequency): string {
  const d = new Date(startDateIso || Date.now());
  if (isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + 1);
    return fallback.toISOString().split('T')[0];
  }
  if (frequency === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (frequency === 'quarterly') {
    d.setMonth(d.getMonth() + 3);
  } else {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString().split('T')[0];
}

export function calculateProfileCompletion(profile: Partial<MemberProfileRecord>): {
  percentage: number;
  isComplete: boolean;
  missingFields: string[];
} {
  const missing: string[] = [];

  if (!profile.fullName?.trim()) missing.push('Full Name');
  if (!profile.dob?.trim()) missing.push('Date of Birth');
  if (!profile.occupation?.trim()) missing.push('Occupation');
  if (!profile.email?.trim() || !isValidEmailAddress(profile.email)) missing.push('Valid Email Address');
  if (!profile.primaryMobile?.trim() || !isValidIndianMobile(profile.primaryMobile)) {
    missing.push('Valid 10-Digit Indian Mobile Number');
  }
  if (!profile.houseAndStreet?.trim()) missing.push('House Number and Street');
  if (!profile.villageTownCity?.trim()) missing.push('Village / Town / City');
  if (!profile.postOffice?.trim()) missing.push('Post Office');
  if (!profile.district?.trim()) missing.push('District');
  if (!profile.state?.trim()) missing.push('State');
  if (!profile.pinCode?.trim() || !isValidIndianPinCode(profile.pinCode)) missing.push('Valid 6-Digit PIN Code');
  if (!profile.country?.trim()) missing.push('Country');
  if (!profile.memberCategory) missing.push('Member Category');
  if (!profile.preferredCommunicationMethod) missing.push('Preferred Communication Method');
  if (!profile.accuracyConfirmed) missing.push('Information Accuracy Declaration');
  if (!profile.dataProcessingConsent) missing.push('Data Processing Consent');

  const totalRequired = 16;
  const completedCount = Math.max(0, totalRequired - missing.length);
  const percentage = Math.round((completedCount / totalRequired) * 100);

  return {
    percentage,
    isComplete: missing.length === 0,
    missingFields: missing,
  };
}

// Memory cache for useSyncExternalStore referential stability
const cacheStore: Record<string, { raw: string | null; parsed: any }> = {};

function readStore<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    const hit = cacheStore[key];
    if (hit && hit.raw === raw) return hit.parsed as T;
    const parsed = JSON.parse(raw);
    cacheStore[key] = { raw, parsed };
    return parsed as T;
  } catch {
    return defaultValue;
  }
}

function writeStore<T>(key: string, value: T, syncSection?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = JSON.stringify(value);
    localStorage.setItem(key, raw);
    cacheStore[key] = { raw, parsed: value };
    window.dispatchEvent(new Event('maden_donators_portal_updated'));
    window.dispatchEvent(new Event('maden_data_updated'));

    if (syncSection) {
      fetch('/api/donators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'syncSection',
          section: syncSection,
          data: value,
        }),
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Error writing donators portal store:', e);
  }
}

export const subscribeDonatorsPortal = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('maden_donators_portal_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('maden_donators_portal_updated', callback);
    window.removeEventListener('storage', callback);
  };
};

export const DonatorsPortalService = {
  getSnapshotTick(): string {
    if (typeof window === 'undefined') return 'server';
    try {
      return (
        (localStorage.getItem(STORAGE_KEYS.MEMBER_PROFILES) || '') +
        (localStorage.getItem(STORAGE_KEYS.DONATIONS) || '') +
        (localStorage.getItem(STORAGE_KEYS.DONATION_PLANS) || '') +
        (localStorage.getItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS) || '') +
        (localStorage.getItem(STORAGE_KEYS.ORG_PAYMENT_SETTINGS) || '') +
        (localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '') +
        (localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '')
      );
    } catch {
      return 'client';
    }
  },

  // Hydrate from server API on client boot
  async hydrateFromCloud(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/donators?section=all');
      if (!res.ok) return;
      const json = await res.json();
      if (!json?.success || !json?.data) return;

      const {
        memberProfiles,
        donationPlans,
        donations,
        paymentSubmissions,
        organizationPaymentSettings,
        notifications,
        auditLogs,
      } = json.data;

      let changed = false;
      if (Array.isArray(memberProfiles) && memberProfiles.length > 0 && !localStorage.getItem(STORAGE_KEYS.MEMBER_PROFILES)) {
        localStorage.setItem(STORAGE_KEYS.MEMBER_PROFILES, JSON.stringify(memberProfiles));
        changed = true;
      }
      if (Array.isArray(donationPlans) && donationPlans.length > 0 && !localStorage.getItem(STORAGE_KEYS.DONATION_PLANS)) {
        localStorage.setItem(STORAGE_KEYS.DONATION_PLANS, JSON.stringify(donationPlans));
        changed = true;
      }
      if (Array.isArray(donations) && donations.length > 0 && !localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
        localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
        changed = true;
      }
      if (Array.isArray(paymentSubmissions) && paymentSubmissions.length > 0 && !localStorage.getItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS)) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS, JSON.stringify(paymentSubmissions));
        changed = true;
      }
      if (organizationPaymentSettings && !localStorage.getItem(STORAGE_KEYS.ORG_PAYMENT_SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.ORG_PAYMENT_SETTINGS, JSON.stringify(organizationPaymentSettings));
        changed = true;
      }
      if (Array.isArray(notifications) && notifications.length > 0 && !localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        changed = true;
      }
      if (Array.isArray(auditLogs) && auditLogs.length > 0 && !localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
        changed = true;
      }

      if (changed) {
        window.dispatchEvent(new Event('maden_donators_portal_updated'));
      }
    } catch {
      // Offline / local mode fallback
    }
  },

  // ---------------- 1. ORGANIZATION PAYMENT SETTINGS ---------------- //
  getPaymentSettings(): OrganizationPaymentSettings {
    const stored = readStore<OrganizationPaymentSettings>(
      STORAGE_KEYS.ORG_PAYMENT_SETTINGS,
      DEFAULT_ORG_PAYMENT_SETTINGS
    );
    return {
      ...DEFAULT_ORG_PAYMENT_SETTINGS,
      ...stored,
      organizationDisplayDetails: {
        ...DEFAULT_ORG_PAYMENT_SETTINGS.organizationDisplayDetails,
        ...(stored?.organizationDisplayDetails || {}),
      },
      portalModuleConfig: {
        ...DEFAULT_ORG_PAYMENT_SETTINGS.portalModuleConfig!,
        ...(stored?.portalModuleConfig || {}),
      },
    };
  },

  updatePaymentSettings(
    actor: { uid: string; email: string; role: UserRole | string },
    updates: Partial<OrganizationPaymentSettings>
  ): { success: boolean; error?: string; settings?: OrganizationPaymentSettings } {
    if (!canManageDonations(actor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an authorized Administrator can modify official payment and QR settings.',
      };
    }

    const current = this.getPaymentSettings();
    const updated: OrganizationPaymentSettings = {
      ...current,
      ...updates,
      organizationDisplayDetails: {
        ...current.organizationDisplayDetails,
        ...(updates.organizationDisplayDetails || {}),
      },
      portalModuleConfig: {
        ...(current.portalModuleConfig || DEFAULT_ORG_PAYMENT_SETTINGS.portalModuleConfig!),
        ...(updates.portalModuleConfig || {}),
      },
      updatedBy: actor.email,
      updatedAt: new Date().toISOString(),
    };

    writeStore(STORAGE_KEYS.ORG_PAYMENT_SETTINGS, updated, 'organizationPaymentSettings');

    this.recordAuditLog({
      actorUid: actor.uid,
      actorEmail: actor.email,
      actorRole: String(actor.role),
      action: 'UPDATED_ORGANIZATION_PAYMENT_SETTINGS',
      targetType: 'payment_settings',
      targetId: 'organizationPaymentSettings',
      details: `Updated Donators Portal & QR configuration (Module Enabled: ${updated.portalModuleConfig?.moduleEnabled !== false}, QR Active: ${updated.activeStatus}, Presets: ${updated.presetAmounts.join(', ')})`,
    });

    return { success: true, settings: updated };
  },

  async forcePullFromCloud(): Promise<{ success: boolean; message: string }> {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Client environment required.' };
    }
    try {
      const res = await fetch('/api/donators?section=all');
      if (!res.ok) {
        return { success: false, message: 'Could not reach cloud endpoint.' };
      }
      const json = await res.json();
      if (!json?.success || !json?.data) {
        return { success: false, message: 'No cloud records found.' };
      }
      const {
        memberProfiles,
        donationPlans,
        donations,
        paymentSubmissions,
        organizationPaymentSettings,
        notifications,
        auditLogs,
      } = json.data;

      if (Array.isArray(memberProfiles)) {
        localStorage.setItem(STORAGE_KEYS.MEMBER_PROFILES, JSON.stringify(memberProfiles));
      }
      if (Array.isArray(donationPlans)) {
        localStorage.setItem(STORAGE_KEYS.DONATION_PLANS, JSON.stringify(donationPlans));
      }
      if (Array.isArray(donations)) {
        localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
      }
      if (Array.isArray(paymentSubmissions)) {
        localStorage.setItem(STORAGE_KEYS.PAYMENT_SUBMISSIONS, JSON.stringify(paymentSubmissions));
      }
      if (organizationPaymentSettings) {
        localStorage.setItem(
          STORAGE_KEYS.ORG_PAYMENT_SETTINGS,
          JSON.stringify(organizationPaymentSettings)
        );
      }
      if (Array.isArray(notifications)) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      }
      if (Array.isArray(auditLogs)) {
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
      }
      Object.keys(cacheStore).forEach((k) => delete cacheStore[k]);
      window.dispatchEvent(new Event('maden_donators_portal_updated'));
      window.dispatchEvent(new Event('maden_data_updated'));
      return {
        success: true,
        message: 'All Member & Donators Portal records synchronized from Supabase Cloud.',
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Cloud sync failed.' };
    }
  },

  // ---------------- 2. MEMBER PROFILES & WIZARD ---------------- //
  getAllMemberProfiles(): MemberProfileRecord[] {
    return readStore<MemberProfileRecord[]>(STORAGE_KEYS.MEMBER_PROFILES, INITIAL_MEMBER_PROFILES);
  },

  generateUniqueMemberId(): string {
    const profiles = this.getAllMemberProfiles();
    const existingIds = new Set(profiles.map((p) => p.memberId));
    const year = new Date().getFullYear();
    let sequence = 100101 + profiles.length;
    let candidate = `MADEN-MEM-${year}-${sequence}`;
    while (existingIds.has(candidate)) {
      sequence += 1;
      candidate = `MADEN-MEM-${year}-${sequence}`;
    }
    return candidate;
  },

  getMemberProfileByUid(uid: string, fallbackEmail?: string, fallbackName?: string): MemberProfileRecord {
    const all = this.getAllMemberProfiles();
    const safeEmail = (fallbackEmail || '').trim().toLowerCase();
    const found = all.find(
      (p) =>
        p &&
        ((uid && uid !== 'guest-member' && p.uid === uid) ||
          (safeEmail &&
            ((p.authEmail || '').toLowerCase() === safeEmail ||
              (p.email || '').toLowerCase() === safeEmail)))
    );

    const nowIso = new Date().toISOString();
    // Prefer authoritative uid if provided; otherwise fallback to found.uid or guest-member
    const resolvedUid = uid && uid !== 'guest-member' ? uid : found?.uid || uid || 'guest-member';
    const defaultScaffold: MemberProfileRecord = {
      uid: resolvedUid,
      memberId: found?.memberId || this.generateUniqueMemberId(),
      authEmail: safeEmail || found?.authEmail || fallbackEmail || '',
      fullName: found?.fullName || fallbackName || 'Foundation Member',
      profilePhotograph: '',
      dob: '',
      gender: '',
      occupation: '',
      email: found?.email || safeEmail || fallbackEmail || '',
      primaryMobile: '',
      alternateMobile: '',
      houseAndStreet: '',
      villageTownCity: '',
      postOffice: '',
      policeStation: '',
      district: '',
      state: 'West Bengal',
      pinCode: '',
      country: 'India',
      membershipRegistrationDate: nowIso.split('T')[0],
      memberCategory: 'individual',
      areasOfInterest: [],
      preferredCommunicationMethod: 'email',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      accuracyConfirmed: false,
      dataProcessingConsent: false,
      promotionalUpdatesConsent: false,
      profileCompletionStatus: 'incomplete',
      completionPercentage: 12,
      currentWizardStep: 1,
      verifiedContactMetadata: {
        mobileNumber: '',
        isVerified: false,
        verificationStatus: 'unverified',
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (!found) return defaultScaffold;

    return {
      ...defaultScaffold,
      ...found,
      // Never allow a stale/mismatched uid to overwrite the caller's authoritative uid
      uid: resolvedUid,
      authEmail: safeEmail || found.authEmail || defaultScaffold.authEmail,
      email: found.email || safeEmail || defaultScaffold.email,
      fullName: found.fullName || fallbackName || defaultScaffold.fullName,
      memberId: found.memberId || defaultScaffold.memberId,
      memberCategory: found.memberCategory || 'individual',
      preferredCommunicationMethod: found.preferredCommunicationMethod || 'email',
      areasOfInterest: Array.isArray(found.areasOfInterest) ? found.areasOfInterest : [],
      emergencyContact: {
        name: found.emergencyContact?.name || '',
        relationship: found.emergencyContact?.relationship || '',
        phone: found.emergencyContact?.phone || '',
      },
      verifiedContactMetadata: {
        ...defaultScaffold.verifiedContactMetadata!,
        ...(found.verifiedContactMetadata || {}),
      },
    };
  },

  saveMemberProfile(
    actorUid: string,
    profileInput: MemberProfileRecord,
    asDraft: boolean = false,
    actorEmail?: string,
    actorRole?: string
  ): { success: boolean; error?: string; profile?: MemberProfileRecord } {
    if (!actorUid) {
      return { success: false, error: 'Unauthorized: Session missing.' };
    }

    const all = this.getAllMemberProfiles();
    const cleanActorEmail = (actorEmail || profileInput.authEmail || profileInput.email || '').trim().toLowerCase();
    const isAdmin =
      actorRole === 'admin' ||
      cleanActorEmail === 'admin@madenfaf.com' ||
      cleanActorEmail === 'pravakarghosh.2025@gmail.com';

    // Verify ownership:
    // If not admin, check if the caller is attempting to overwrite another member's profile
    if (!isAdmin && profileInput.uid && actorUid !== profileInput.uid && profileInput.uid !== 'guest-member') {
      const targetOwner = all.find((p) => p.uid === profileInput.uid);
      const isSameEmail =
        targetOwner &&
        cleanActorEmail &&
        ((targetOwner.authEmail || '').trim().toLowerCase() === cleanActorEmail ||
          (targetOwner.email || '').trim().toLowerCase() === cleanActorEmail);

      // If the target profile belongs to an entirely different person, forbid the edit
      if (targetOwner && !isSameEmail) {
        return { success: false, error: 'Unauthorized: You can only edit your own Member profile.' };
      }
    }

    // Always bind the saved profile to the actor's authoritative UID
    const authoritativeUid = actorUid;

    // Locate existing record by authoritativeUid, input uid, or verified email
    const existingIdx = all.findIndex(
      (p) =>
        p &&
        (p.uid === authoritativeUid ||
          (profileInput.uid && p.uid === profileInput.uid) ||
          (cleanActorEmail &&
            ((p.authEmail || '').toLowerCase() === cleanActorEmail ||
              (p.email || '').toLowerCase() === cleanActorEmail)))
    );
    const existingRecord = existingIdx >= 0 ? all[existingIdx] : null;

    // Ensure Member ID is never duplicated across different UIDs
    let assignedMemberId = existingRecord?.memberId || profileInput.memberId || this.generateUniqueMemberId();
    const duplicateOwner = all.find((p) => p.memberId === assignedMemberId && p.uid !== authoritativeUid);
    if (duplicateOwner) {
      assignedMemberId = this.generateUniqueMemberId();
    }

    const cleanMobile = normalizeIndianMobile(profileInput.primaryMobile || '');
    const cleanAltMobile = profileInput.alternateMobile ? normalizeIndianMobile(profileInput.alternateMobile) : '';

    if (!asDraft) {
      const check = calculateProfileCompletion({
        ...profileInput,
        primaryMobile: cleanMobile,
      });
      if (!check.isComplete) {
        return {
          success: false,
          error: `Please complete all required fields: ${check.missingFields.join(', ')}`,
        };
      }
      if (cleanAltMobile && !isValidIndianMobile(cleanAltMobile)) {
        return {
          success: false,
          error: 'Alternate Mobile Number must be a valid 10-digit Indian mobile number.',
        };
      }
    }

    const completion = calculateProfileCompletion({
      ...profileInput,
      primaryMobile: cleanMobile,
    });

    // Preserve verified contact metadata if mobile number has not changed
    const prevVerifiedMeta = existingRecord?.verifiedContactMetadata;
    const mobileUnchanged = prevVerifiedMeta && prevVerifiedMeta.mobileNumber === cleanMobile;

    const updatedVerifiedMeta: VerifiedContactMetadata = mobileUnchanged
      ? prevVerifiedMeta
      : {
          mobileNumber: cleanMobile,
          isVerified: false,
          verificationStatus: 'unverified',
        };

    const nowIso = new Date().toISOString();
    const finalProfile: MemberProfileRecord = {
      ...profileInput,
      uid: authoritativeUid,
      memberId: assignedMemberId,
      // Always preserve verified authEmail separately from editable profile.email
      authEmail: existingRecord?.authEmail || cleanActorEmail || profileInput.authEmail || profileInput.email,
      email: profileInput.email || cleanActorEmail || existingRecord?.email || '',
      primaryMobile: cleanMobile,
      alternateMobile: cleanAltMobile,
      profileCompletionStatus: asDraft
        ? completion.isComplete
          ? 'complete'
          : 'draft'
        : completion.isComplete
        ? 'complete'
        : 'draft',
      completionPercentage: completion.percentage,
      verifiedContactMetadata: updatedVerifiedMeta,
      createdAt: existingRecord?.createdAt || profileInput.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const updatedList =
      existingIdx >= 0
        ? all.map((p, idx) => (idx === existingIdx ? finalProfile : p))
        : [finalProfile, ...all];

    writeStore(STORAGE_KEYS.MEMBER_PROFILES, updatedList, 'memberProfiles');

    if (!asDraft && completion.isComplete && existingRecord?.profileCompletionStatus !== 'complete') {
      this.createNotification({
        uid: finalProfile.uid,
        memberId: finalProfile.memberId,
        title: 'Member Profile Completed',
        message: `Welcome to the MADEN FAF Donators Portal! Your official Member ID is ${finalProfile.memberId}.`,
        category: 'profile',
      });
    }

    return { success: true, profile: finalProfile };
  },

  // ---------------- 3. MOBILE NUMBER CONFIRMATION WORKFLOW (SECTION 8) ---------------- //
  requestMobileVerificationConfirmation(
    uid: string,
    mobileNumber: string
  ): {
    success: boolean;
    mode: 'sms_otp_dispatched' | 'pending_admin_verification';
    message: string;
    error?: string;
  } {
    const cleanMobile = normalizeIndianMobile(mobileNumber);
    if (!isValidIndianMobile(cleanMobile)) {
      return {
        success: false,
        mode: 'pending_admin_verification',
        message: '',
        error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      };
    }

    const settings = this.getPaymentSettings();
    const all = this.getAllMemberProfiles();
    const idx = all.findIndex((p) => p.uid === uid);
    if (idx === -1) {
      return {
        success: false,
        mode: 'pending_admin_verification',
        message: '',
        error: 'Please save your Member Profile before confirming your mobile number.',
      };
    }

    const profile = all[idx];
    const now = new Date();
    const lastReq = profile.verifiedContactMetadata?.lastConfirmationRequestedAt
      ? new Date(profile.verifiedContactMetadata.lastConfirmationRequestedAt)
      : null;

    // Enforce 30-second cooldown between verification requests
    if (lastReq && now.getTime() - lastReq.getTime() < 30 * 1000) {
      const waitSec = Math.ceil((30 * 1000 - (now.getTime() - lastReq.getTime())) / 1000);
      return {
        success: false,
        mode: 'pending_admin_verification',
        message: '',
        error: `Please wait ${waitSec} seconds before requesting another mobile confirmation.`,
      };
    }

    // Never simulate fake OTP verification!
    // If no external SMS OTP provider is configured, record as 'pending_admin_verification'
    if (!settings.smsOtpProviderConfigured) {
      const updatedProfile: MemberProfileRecord = {
        ...profile,
        primaryMobile: cleanMobile,
        verifiedContactMetadata: {
          mobileNumber: cleanMobile,
          isVerified: false,
          verificationStatus: 'pending_admin_verification',
          verificationMethod: 'pending_provider',
          lastConfirmationRequestedAt: now.toISOString(),
        },
        updatedAt: now.toISOString(),
      };
      all[idx] = updatedProfile;
      writeStore(STORAGE_KEYS.MEMBER_PROFILES, [...all], 'memberProfiles');

      // Also update any awaiting/submitted donations for this user with mobile number
      const allDonations = this.getAllDonations();
      const updatedDonations = allDonations.map((d) =>
        d.uid === uid && d.paymentStatus !== 'verified'
          ? {
              ...d,
              donorMobile: cleanMobile,
              mobileVerificationStatus: 'pending_admin_verification' as MobileVerificationStatus,
              updatedAt: now.toISOString(),
            }
          : d
      );
      writeStore(STORAGE_KEYS.DONATIONS, updatedDonations, 'donations');

      this.createNotification({
        uid: profile.uid,
        memberId: profile.memberId,
        title: 'Mobile Number Confirmation Logged',
        message: `Mobile number +91 ${cleanMobile} has been registered for administrative cross-verification alongside your UPI contribution.`,
        category: 'mobile_verification',
      });

      return {
        success: true,
        mode: 'pending_admin_verification',
        message:
          'SMS OTP gateway is not currently active in this environment. Your mobile number (+91 ' +
          cleanMobile +
          ') has been logged under the Authorized Administrative Verification Workflow and will be verified alongside your UPI payment record.',
      };
    }

    return {
      success: true,
      mode: 'sms_otp_dispatched',
      message: 'Verification request initiated via configured SMS provider.',
    };
  },

  adminVerifyMemberMobile(
    adminActor: { uid: string; email: string; role: UserRole | string },
    targetUid: string
  ): { success: boolean; error?: string } {
    if (!canManageDonations(adminActor.role)) {
      return { success: false, error: 'Unauthorized: Only an Administrator can verify donor mobile numbers.' };
    }

    const all = this.getAllMemberProfiles();
    const idx = all.findIndex((p) => p.uid === targetUid);
    if (idx === -1) return { success: false, error: 'Member profile not found.' };

    const nowIso = new Date().toISOString();
    const target = all[idx];
    all[idx] = {
      ...target,
      verifiedContactMetadata: {
        mobileNumber: target.primaryMobile,
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: nowIso,
        verifiedBy: adminActor.email,
        verificationMethod: 'admin_verified',
      },
      updatedAt: nowIso,
    };
    writeStore(STORAGE_KEYS.MEMBER_PROFILES, [...all], 'memberProfiles');

    // Sync mobileVerificationStatus on member's donations
    const donations = this.getAllDonations().map((d) =>
      d.uid === targetUid
        ? { ...d, mobileVerificationStatus: 'verified' as MobileVerificationStatus, updatedAt: nowIso }
        : d
    );
    writeStore(STORAGE_KEYS.DONATIONS, donations, 'donations');

    this.recordAuditLog({
      actorUid: adminActor.uid,
      actorEmail: adminActor.email,
      actorRole: String(adminActor.role),
      action: 'VERIFIED_DONOR_MOBILE_NUMBER',
      targetType: 'member_profile',
      targetId: target.memberId,
      details: `Verified mobile number +91 ${target.primaryMobile} for Member ${target.fullName} (${target.memberId})`,
    });

    this.createNotification({
      uid: target.uid,
      memberId: target.memberId,
      title: 'Mobile Number Verified',
      message: `Your registered mobile number (+91 ${target.primaryMobile}) has been verified by MADEN FAF Administration.`,
      category: 'mobile_verification',
    });

    return { success: true };
  },

  // ---------------- 4. DONATION PLANS & COMMITMENTS (SECTIONS 6 & 11) ---------------- //
  getAllDonationPlans(): DonationPlanRecord[] {
    return readStore<DonationPlanRecord[]>(STORAGE_KEYS.DONATION_PLANS, []);
  },

  getMemberDonationPlans(uid: string): DonationPlanRecord[] {
    return this.getAllDonationPlans().filter((p) => p.uid === uid);
  },

  createDonationAndCommitmentPlan(params: {
    uid: string;
    amount: number;
    frequency: DonationFrequency;
    purpose: string;
  }): {
    success: boolean;
    error?: string;
    donation?: DonationRecordItem;
    plan?: DonationPlanRecord;
  } {
    const settings = this.getPaymentSettings();
    const profile = this.getAllMemberProfiles().find((p) => p.uid === params.uid);

    if (!profile || profile.profileCompletionStatus !== 'complete') {
      return {
        success: false,
        error: 'Please complete your 4-step Member Profile before initiating a donation.',
      };
    }

    const cleanAmount = Math.round(Number(params.amount));
    if (
      isNaN(cleanAmount) ||
      cleanAmount < settings.minCustomAmount ||
      cleanAmount > settings.maxCustomAmount
    ) {
      return {
        success: false,
        error: `Donation amount must be between ₹${settings.minCustomAmount.toLocaleString('en-IN')} and ₹${settings.maxCustomAmount.toLocaleString('en-IN')}.`,
      };
    }

    if (!settings.allowedFrequencies.includes(params.frequency)) {
      return {
        success: false,
        error: `Selected frequency (${params.frequency}) is not currently enabled.`,
      };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const todayStr = nowIso.split('T')[0];
    const year = now.getFullYear();

    // 1. Create or update active Donation Plan commitment for this member
    const allPlans = this.getAllDonationPlans();
    const existingActiveIdx = allPlans.findIndex(
      (p) => p.uid === params.uid && p.status === 'active'
    );

    const planId =
      existingActiveIdx >= 0
        ? allPlans[existingActiveIdx].planId
        : `MADEN-PLN-${year}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPlan: DonationPlanRecord = {
      planId,
      uid: params.uid,
      memberId: profile.memberId,
      donorName: profile.fullName,
      amount: cleanAmount,
      frequency: params.frequency,
      purpose: params.purpose.trim() || 'General Grassroots Football & Scholarship Support',
      startDate: existingActiveIdx >= 0 ? allPlans[existingActiveIdx].startDate : todayStr,
      nextSuggestedPaymentDate: calculateNextSuggestedDate(todayStr, params.frequency),
      status: 'active',
      reminderEnabled: true,
      createdAt: existingActiveIdx >= 0 ? allPlans[existingActiveIdx].createdAt : nowIso,
      updatedAt: nowIso,
    };

    const updatedPlans =
      existingActiveIdx >= 0
        ? allPlans.map((p, i) => (i === existingActiveIdx ? newPlan : p))
        : [newPlan, ...allPlans];
    writeStore(STORAGE_KEYS.DONATION_PLANS, updatedPlans, 'donationPlans');

    // 2. Generate unique Invoice Number & Donation Reference
    const allDonations = this.getAllDonations();
    const existingInvoiceNums = new Set(allDonations.map((d) => d.invoiceNumber));
    const existingDonationIds = new Set(allDonations.map((d) => d.donationId));

    let invSeq = Math.max(settings.nextInvoiceSequence, 1001 + allDonations.length);
    let invoiceNumber = `${settings.invoicePrefix}-${year}-${String(invSeq).padStart(6, '0')}`;
    while (existingInvoiceNums.has(invoiceNumber)) {
      invSeq += 1;
      invoiceNumber = `${settings.invoicePrefix}-${year}-${String(invSeq).padStart(6, '0')}`;
    }

    let donationId = `MADEN-DON-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
    while (existingDonationIds.has(donationId)) {
      donationId = `MADEN-DON-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Increment nextInvoiceSequence in settings
    writeStore(
      STORAGE_KEYS.ORG_PAYMENT_SETTINGS,
      { ...settings, nextInvoiceSequence: invSeq + 1 },
      'organizationPaymentSettings'
    );

    const formattedAddress = [
      profile.houseAndStreet,
      profile.villageTownCity,
      profile.postOffice ? `P.O. ${profile.postOffice}` : '',
      profile.district,
      profile.state,
      profile.pinCode,
      profile.country,
    ]
      .filter(Boolean)
      .join(', ');

    const newDonation: DonationRecordItem = {
      donationId,
      uid: params.uid,
      memberId: profile.memberId,
      donorName: profile.fullName,
      donorEmail: profile.email,
      donorAddress: formattedAddress,
      donorMobile: profile.primaryMobile,
      planId: newPlan.planId,
      invoiceNumber,
      amount: cleanAmount,
      amountInWords: numberToIndianRupeeWords(cleanAmount),
      currency: 'INR',
      frequency: params.frequency,
      purpose: newPlan.purpose,
      paymentMethod: 'official_qr_upi',
      paymentStatus: 'awaiting_payment',
      mobileVerificationStatus: profile.verifiedContactMetadata?.isVerified
        ? 'verified'
        : profile.verifiedContactMetadata?.verificationStatus || 'unverified',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    writeStore(STORAGE_KEYS.DONATIONS, [newDonation, ...allDonations], 'donations');

    this.createNotification({
      uid: profile.uid,
      memberId: profile.memberId,
      title: `Donation Invoice Generated (${invoiceNumber})`,
      message: `Your contribution request of ₹${cleanAmount.toLocaleString('en-IN')} (${params.frequency}) has been created with Reference ${donationId}. Complete payment via the official QR code and submit your UTR for verification.`,
      category: 'payment',
      relatedDonationId: donationId,
    });

    return {
      success: true,
      donation: newDonation,
      plan: newPlan,
    };
  },

  updateFutureContributionPlan(
    uid: string,
    planId: string,
    updates: {
      amount?: number;
      frequency?: DonationFrequency;
      status?: 'active' | 'paused' | 'cancelled';
      reminderEnabled?: boolean;
      purpose?: string;
    }
  ): { success: boolean; error?: string; plan?: DonationPlanRecord } {
    const allPlans = this.getAllDonationPlans();
    const idx = allPlans.findIndex((p) => p.planId === planId && p.uid === uid);
    if (idx === -1) {
      return { success: false, error: 'Contribution plan not found or unauthorized.' };
    }

    const settings = this.getPaymentSettings();
    const current = allPlans[idx];

    if (updates.amount !== undefined) {
      if (updates.amount < settings.minCustomAmount || updates.amount > settings.maxCustomAmount) {
        return {
          success: false,
          error: `Amount must be between ₹${settings.minCustomAmount.toLocaleString('en-IN')} and ₹${settings.maxCustomAmount.toLocaleString('en-IN')}.`,
        };
      }
    }

    const nextFrequency = updates.frequency || current.frequency;
    const updatedPlan: DonationPlanRecord = {
      ...current,
      amount: updates.amount !== undefined ? Math.round(updates.amount) : current.amount,
      frequency: nextFrequency,
      status: updates.status || current.status,
      reminderEnabled:
        updates.reminderEnabled !== undefined ? updates.reminderEnabled : current.reminderEnabled,
      purpose: updates.purpose !== undefined ? updates.purpose : current.purpose,
      nextSuggestedPaymentDate:
        updates.frequency && updates.frequency !== current.frequency
          ? calculateNextSuggestedDate(new Date().toISOString().split('T')[0], nextFrequency)
          : current.nextSuggestedPaymentDate,
      updatedAt: new Date().toISOString(),
    };

    // IMPORTANT (Section 11): Changing a plan must NEVER rewrite historical donation amounts or payment records.
    allPlans[idx] = updatedPlan;
    writeStore(STORAGE_KEYS.DONATION_PLANS, [...allPlans], 'donationPlans');

    return { success: true, plan: updatedPlan };
  },

  // ---------------- 5. DONATIONS & PAYMENT SUBMISSIONS (SECTIONS 7, 9, 10) ---------------- //
  getAllDonations(): DonationRecordItem[] {
    return readStore<DonationRecordItem[]>(STORAGE_KEYS.DONATIONS, []);
  },

  getMemberDonations(uid: string): DonationRecordItem[] {
    return this.getAllDonations().filter((d) => d.uid === uid);
  },

  getAllPaymentSubmissions(): PaymentSubmissionRecord[] {
    return readStore<PaymentSubmissionRecord[]>(STORAGE_KEYS.PAYMENT_SUBMISSIONS, []);
  },

  getMemberPaymentSubmissions(uid: string): PaymentSubmissionRecord[] {
    return this.getAllPaymentSubmissions().filter((s) => s.uid === uid);
  },

  cancelPendingDonation(uid: string, donationId: string): { success: boolean; error?: string } {
    const all = this.getAllDonations();
    const idx = all.findIndex((d) => d.donationId === donationId && d.uid === uid);
    if (idx === -1) return { success: false, error: 'Donation record not found.' };

    if (all[idx].paymentStatus !== 'awaiting_payment') {
      return {
        success: false,
        error: 'Only unpaid contributions in "Awaiting Payment" status can be cancelled by the donor.',
      };
    }

    all[idx] = {
      ...all[idx],
      paymentStatus: 'cancelled',
      updatedAt: new Date().toISOString(),
    };
    writeStore(STORAGE_KEYS.DONATIONS, [...all], 'donations');
    return { success: true };
  },

  submitPaymentConfirmation(params: {
    uid: string;
    donationId: string;
    donorName: string;
    registeredMobile: string;
    transactionReference: string;
    paymentDate: string;
    submittedAmount: number;
    evidenceFileReference?: string;
    declarationAccepted: boolean;
  }): { success: boolean; error?: string; submission?: PaymentSubmissionRecord } {
    if (!params.declarationAccepted) {
      return {
        success: false,
        error: 'You must confirm the declaration that the payment was genuinely initiated.',
      };
    }

    const cleanMobile = normalizeIndianMobile(params.registeredMobile);
    if (!isValidIndianMobile(cleanMobile)) {
      return {
        success: false,
        error: 'Please enter a valid 10-digit registered Indian mobile number.',
      };
    }

    const cleanUtr = params.transactionReference.trim().toUpperCase();
    if (cleanUtr.length < 6 || cleanUtr.length > 36 || !/^[A-Z0-9_-]+$/.test(cleanUtr)) {
      return {
        success: false,
        error: 'Please enter a valid UPI Transaction ID / UTR (6–36 alphanumeric characters, e.g. 12-digit UTR).',
      };
    }

    if (!params.paymentDate) {
      return { success: false, error: 'Please provide the payment date.' };
    }

    const allDonations = this.getAllDonations();
    const donIdx = allDonations.findIndex(
      (d) => d.donationId === params.donationId && d.uid === params.uid
    );
    if (donIdx === -1) {
      return { success: false, error: 'Pending donation record not found for your account.' };
    }

    const donation = allDonations[donIdx];
    if (donation.paymentStatus === 'verified') {
      return { success: false, error: 'This donation has already been verified and marked as paid.' };
    }
    if (donation.paymentStatus === 'cancelled' || donation.paymentStatus === 'refunded') {
      return { success: false, error: `Cannot submit payment for a ${donation.paymentStatus} record.` };
    }

    // Validate submitted amount against the pending donation record
    if (Math.round(Number(params.submittedAmount)) !== Math.round(donation.amount)) {
      return {
        success: false,
        error: `Entered amount (₹${Number(params.submittedAmount).toLocaleString('en-IN')}) does not match the scheduled invoice amount (₹${donation.amount.toLocaleString('en-IN')}).`,
      };
    }

    // Prevent duplicate transaction references across non-rejected submissions
    const allSubmissions = this.getAllPaymentSubmissions();
    const duplicateUtr = allSubmissions.find(
      (s) =>
        s.transactionReference.toUpperCase() === cleanUtr &&
        s.verificationStatus !== 'rejected' &&
        s.donationId !== params.donationId
    );
    if (duplicateUtr) {
      return {
        success: false,
        error: `Transaction Reference / UTR "${cleanUtr}" has already been submitted for another donation. Duplicate transaction references are not permitted.`,
      };
    }

    // Also block duplicate pending submission on the same donation
    const existingPendingForSameDonation = allSubmissions.find(
      (s) =>
        s.donationId === params.donationId &&
        s.verificationStatus === 'submitted_for_verification'
    );
    if (existingPendingForSameDonation) {
      return {
        success: false,
        error: 'A payment confirmation for this donation is already awaiting administrative verification.',
      };
    }

    const nowIso = new Date().toISOString();
    const submissionId = `MADEN-SUB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newSubmission: PaymentSubmissionRecord = {
      submissionId,
      donationId: donation.donationId,
      uid: params.uid,
      memberId: donation.memberId,
      donorName: params.donorName.trim() || donation.donorName,
      registeredMobile: cleanMobile,
      transactionReference: cleanUtr,
      submittedAmount: donation.amount,
      paymentDate: params.paymentDate,
      evidenceFileReference: params.evidenceFileReference || '',
      declarationAccepted: true,
      verificationStatus: 'submitted_for_verification',
      submittedAt: nowIso,
    };

    writeStore(
      STORAGE_KEYS.PAYMENT_SUBMISSIONS,
      [newSubmission, ...allSubmissions],
      'paymentSubmissions'
    );

    // Update donation status to 'submitted_for_verification' (NEVER mark as verified automatically!)
    allDonations[donIdx] = {
      ...donation,
      transactionReference: cleanUtr,
      paymentDate: params.paymentDate,
      donorMobile: cleanMobile,
      paymentStatus: 'submitted_for_verification',
      rejectionReason: undefined,
      updatedAt: nowIso,
    };
    writeStore(STORAGE_KEYS.DONATIONS, [...allDonations], 'donations');

    this.createNotification({
      uid: donation.uid,
      memberId: donation.memberId,
      title: 'Payment Submitted for Verification',
      message: `Your payment submission (UTR: ${cleanUtr}) for ₹${donation.amount.toLocaleString('en-IN')} has been recorded as "Submitted for Verification". An official receipt will be issued once verified by MADEN FAF Administration.`,
      category: 'payment',
      relatedDonationId: donation.donationId,
    });

    return { success: true, submission: newSubmission };
  },

  // ---------------- 6. ADMIN VERIFICATION, REJECTION & REFUNDS (SECTION 12) ---------------- //
  adminVerifyPaymentSubmission(params: {
    adminActor: { uid: string; email: string; role: UserRole | string };
    submissionId: string;
  }): { success: boolean; error?: string; donation?: DonationRecordItem } {
    if (!canManageDonations(params.adminActor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an authorized Administrator can verify donor payments.',
      };
    }

    const allSubmissions = this.getAllPaymentSubmissions();
    const subIdx = allSubmissions.findIndex((s) => s.submissionId === params.submissionId);
    if (subIdx === -1) {
      return { success: false, error: 'Payment submission record not found.' };
    }

    const submission = allSubmissions[subIdx];
    const allDonations = this.getAllDonations();
    const donIdx = allDonations.findIndex((d) => d.donationId === submission.donationId);
    if (donIdx === -1) {
      return { success: false, error: 'Associated donation record not found.' };
    }

    const donation = allDonations[donIdx];

    // Idempotency guard: if already verified, return existing verified donation without issuing duplicate receipt
    if (donation.paymentStatus === 'verified' && donation.receiptNumber) {
      return { success: true, donation };
    }

    const settings = this.getPaymentSettings();
    const nowIso = new Date().toISOString();
    const year = new Date().getFullYear();

    // Generate unique Receipt Number
    const existingReceiptNums = new Set(
      allDonations.map((d) => d.receiptNumber).filter(Boolean) as string[]
    );
    let rcpSeq = Math.max(settings.nextReceiptSequence, 1001);
    let receiptNumber = `${settings.receiptPrefix}-${year}-${String(rcpSeq).padStart(6, '0')}`;
    while (existingReceiptNums.has(receiptNumber)) {
      rcpSeq += 1;
      receiptNumber = `${settings.receiptPrefix}-${year}-${String(rcpSeq).padStart(6, '0')}`;
    }

    writeStore(
      STORAGE_KEYS.ORG_PAYMENT_SETTINGS,
      { ...settings, nextReceiptSequence: rcpSeq + 1 },
      'organizationPaymentSettings'
    );

    // Update submission
    allSubmissions[subIdx] = {
      ...submission,
      verificationStatus: 'verified',
      reviewedBy: params.adminActor.email,
      reviewedAt: nowIso,
    };
    writeStore(STORAGE_KEYS.PAYMENT_SUBMISSIONS, [...allSubmissions], 'paymentSubmissions');

    // Update donation
    const verifiedDonation: DonationRecordItem = {
      ...donation,
      receiptNumber,
      paymentStatus: 'verified',
      mobileVerificationStatus: 'verified',
      transactionReference: submission.transactionReference,
      paymentDate: submission.paymentDate,
      verifiedBy: params.adminActor.email,
      verifiedAt: nowIso,
      updatedAt: nowIso,
    };
    allDonations[donIdx] = verifiedDonation;
    writeStore(STORAGE_KEYS.DONATIONS, [...allDonations], 'donations');

    // Also mark member's mobile number as verified if matching
    const profiles = this.getAllMemberProfiles();
    const profIdx = profiles.findIndex((p) => p.uid === donation.uid);
    if (profIdx >= 0) {
      profiles[profIdx] = {
        ...profiles[profIdx],
        verifiedContactMetadata: {
          mobileNumber: profiles[profIdx].primaryMobile,
          isVerified: true,
          verificationStatus: 'verified',
          verifiedAt: nowIso,
          verifiedBy: params.adminActor.email,
          verificationMethod: 'admin_verified',
        },
        updatedAt: nowIso,
      };
      writeStore(STORAGE_KEYS.MEMBER_PROFILES, [...profiles], 'memberProfiles');
    }

    this.recordAuditLog({
      actorUid: params.adminActor.uid,
      actorEmail: params.adminActor.email,
      actorRole: String(params.adminActor.role),
      action: 'VERIFIED_PAYMENT_AND_ISSUED_RECEIPT',
      targetType: 'donation',
      targetId: donation.donationId,
      details: `Verified UTR ${submission.transactionReference} for ₹${donation.amount.toLocaleString('en-IN')} (${donation.donorName}, ${donation.memberId}). Issued Official Receipt ${receiptNumber}.`,
    });

    this.createNotification({
      uid: donation.uid,
      memberId: donation.memberId,
      title: `Donation Verified — Receipt ${receiptNumber} Issued`,
      message: `Thank you! Your contribution of ₹${donation.amount.toLocaleString('en-IN')} (UTR: ${submission.transactionReference}) has been verified. Official Donation Receipt ${receiptNumber} is now available for download.`,
      category: 'receipt',
      relatedDonationId: donation.donationId,
    });

    return { success: true, donation: verifiedDonation };
  },

  adminRejectPaymentSubmission(params: {
    adminActor: { uid: string; email: string; role: UserRole | string };
    submissionId: string;
    rejectionReason: string;
  }): { success: boolean; error?: string } {
    if (!canManageDonations(params.adminActor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an authorized Administrator can reject payment submissions.',
      };
    }

    if (!params.rejectionReason.trim()) {
      return { success: false, error: 'Please provide a clear reason for rejecting the submission.' };
    }

    const allSubmissions = this.getAllPaymentSubmissions();
    const subIdx = allSubmissions.findIndex((s) => s.submissionId === params.submissionId);
    if (subIdx === -1) return { success: false, error: 'Payment submission not found.' };

    const submission = allSubmissions[subIdx];
    const nowIso = new Date().toISOString();

    allSubmissions[subIdx] = {
      ...submission,
      verificationStatus: 'rejected',
      rejectionReason: params.rejectionReason.trim(),
      reviewedBy: params.adminActor.email,
      reviewedAt: nowIso,
    };
    writeStore(STORAGE_KEYS.PAYMENT_SUBMISSIONS, [...allSubmissions], 'paymentSubmissions');

    const allDonations = this.getAllDonations();
    const donIdx = allDonations.findIndex((d) => d.donationId === submission.donationId);
    if (donIdx >= 0) {
      allDonations[donIdx] = {
        ...allDonations[donIdx],
        paymentStatus: 'rejected',
        rejectionReason: params.rejectionReason.trim(),
        updatedAt: nowIso,
      };
      writeStore(STORAGE_KEYS.DONATIONS, [...allDonations], 'donations');

      this.createNotification({
        uid: allDonations[donIdx].uid,
        memberId: allDonations[donIdx].memberId,
        title: 'Payment Verification Requires Attention',
        message: `Your payment submission (UTR: ${submission.transactionReference}) for ${allDonations[donIdx].donationId} could not be verified: "${params.rejectionReason.trim()}". You may resubmit valid transaction details.`,
        category: 'payment',
        relatedDonationId: allDonations[donIdx].donationId,
      });
    }

    this.recordAuditLog({
      actorUid: params.adminActor.uid,
      actorEmail: params.adminActor.email,
      actorRole: String(params.adminActor.role),
      action: 'REJECTED_PAYMENT_SUBMISSION',
      targetType: 'submission',
      targetId: submission.submissionId,
      details: `Rejected UTR ${submission.transactionReference} for Donation ${submission.donationId}. Reason: ${params.rejectionReason.trim()}`,
    });

    return { success: true };
  },

  adminRecordRefundOrReversal(params: {
    adminActor: { uid: string; email: string; role: UserRole | string };
    donationId: string;
    reversalReason: string;
  }): { success: boolean; error?: string; donation?: DonationRecordItem } {
    if (!canManageDonations(params.adminActor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an authorized Administrator can record refunds or reversals.',
      };
    }

    if (!params.reversalReason.trim()) {
      return { success: false, error: 'Please specify the reason for the refund or reversal.' };
    }

    const allDonations = this.getAllDonations();
    const idx = allDonations.findIndex((d) => d.donationId === params.donationId);
    if (idx === -1) return { success: false, error: 'Donation record not found.' };

    const current = allDonations[idx];
    if (current.paymentStatus !== 'verified') {
      return {
        success: false,
        error: 'Only previously verified donations can be marked as refunded/reversed.',
      };
    }

    const settings = this.getPaymentSettings();
    const nowIso = new Date().toISOString();
    const year = new Date().getFullYear();
    const revSeq = Math.max(settings.nextReversalSequence || 1001, 1001);
    const reversalDocumentNumber = `${settings.reversalPrefix || 'MADEN-REV'}-${year}-${String(revSeq).padStart(6, '0')}`;

    writeStore(
      STORAGE_KEYS.ORG_PAYMENT_SETTINGS,
      { ...settings, nextReversalSequence: revSeq + 1 },
      'organizationPaymentSettings'
    );

    // Retain original invoiceNumber and receiptNumber for audit integrity, and attach reversal metadata
    const reversedDonation: DonationRecordItem = {
      ...current,
      paymentStatus: 'refunded',
      reversalDocumentNumber,
      reversalReason: params.reversalReason.trim(),
      reversedAt: nowIso,
      reversedBy: params.adminActor.email,
      updatedAt: nowIso,
    };

    allDonations[idx] = reversedDonation;
    writeStore(STORAGE_KEYS.DONATIONS, [...allDonations], 'donations');

    this.recordAuditLog({
      actorUid: params.adminActor.uid,
      actorEmail: params.adminActor.email,
      actorRole: String(params.adminActor.role),
      action: 'RECORDED_REFUND_REVERSAL',
      targetType: 'refund_reversal',
      targetId: current.donationId,
      details: `Reversed verified donation ${current.donationId} (Original Receipt ${current.receiptNumber} retained). Issued Reversal Note ${reversalDocumentNumber}. Reason: ${params.reversalReason.trim()}`,
    });

    this.createNotification({
      uid: current.uid,
      memberId: current.memberId,
      title: `Contribution Reversal / Refund Recorded (${reversalDocumentNumber})`,
      message: `A refund/reversal has been recorded for donation ${current.donationId} (₹${current.amount.toLocaleString('en-IN')}). Original receipt ${current.receiptNumber} is retained in the audit log alongside Reversal Note ${reversalDocumentNumber}.`,
      category: 'receipt',
      relatedDonationId: current.donationId,
    });

    return { success: true, donation: reversedDonation };
  },

  // ---------------- 7. NOTIFICATIONS & AUDIT LOGS ---------------- //
  getMemberNotifications(uid: string): DonorPortalNotification[] {
    const all = readStore<DonorPortalNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter((n) => n.uid === uid);
  },

  createNotification(params: {
    uid: string;
    memberId: string;
    title: string;
    message: string;
    category: DonorPortalNotification['category'];
    relatedDonationId?: string;
  }): void {
    const all = readStore<DonorPortalNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const item: DonorPortalNotification = {
      id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      uid: params.uid,
      memberId: params.memberId,
      title: params.title,
      message: params.message,
      category: params.category,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedDonationId: params.relatedDonationId,
    };
    writeStore(STORAGE_KEYS.NOTIFICATIONS, [item, ...all], 'notifications');
  },

  markNotificationRead(uid: string, notificationId: string): void {
    const all = readStore<DonorPortalNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = all.map((n) => (n.id === notificationId && n.uid === uid ? { ...n, isRead: true } : n));
    writeStore(STORAGE_KEYS.NOTIFICATIONS, updated, 'notifications');
  },

  markAllNotificationsRead(uid: string): void {
    const all = readStore<DonorPortalNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = all.map((n) => (n.uid === uid ? { ...n, isRead: true } : n));
    writeStore(STORAGE_KEYS.NOTIFICATIONS, updated, 'notifications');
  },

  getAdminAuditLogs(actorRole?: UserRole | string | null): AdminAuditLogEntry[] {
    if (!canManageDonations(actorRole)) return [];
    return readStore<AdminAuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  },

  recordAuditLog(entry: Omit<AdminAuditLogEntry, 'logId' | 'timestamp'>): void {
    const all = readStore<AdminAuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const newEntry: AdminAuditLogEntry = {
      ...entry,
      logId: `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
    };
    writeStore(STORAGE_KEYS.AUDIT_LOGS, [newEntry, ...all], 'auditLogs');
  },

  // ---------------- 8. BACKEND ADMIN CRUD FOR MEMBERS, PLANS, DONATIONS & BROADCASTS ---------------- //
  adminUpsertMemberProfile(
    adminActor: { uid: string; email: string; role: UserRole | string },
    profileInput: Partial<MemberProfileRecord> & { email: string; fullName: string }
  ): { success: boolean; error?: string; profile?: MemberProfileRecord } {
    if (!canManageDonations(adminActor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an Administrator can create or edit Member profiles from the backend.',
      };
    }

    const cleanEmail = (profileInput.email || '').trim().toLowerCase();
    const cleanName = (profileInput.fullName || '').trim();
    if (!cleanEmail || !isValidEmailAddress(cleanEmail)) {
      return { success: false, error: 'Please provide a valid email address for the Member.' };
    }
    if (!cleanName) {
      return { success: false, error: 'Please provide the Member full name.' };
    }

    const all = this.getAllMemberProfiles();
    const existingIdx = all.findIndex(
      (p) =>
        (profileInput.uid && p.uid === profileInput.uid) ||
        p.authEmail.toLowerCase() === cleanEmail ||
        p.email.toLowerCase() === cleanEmail
    );
    const existing = existingIdx >= 0 ? all[existingIdx] : null;
    const nowIso = new Date().toISOString();

    const cleanMobile = profileInput.primaryMobile
      ? normalizeIndianMobile(profileInput.primaryMobile)
      : existing?.primaryMobile || '';

    const uid = existing?.uid || profileInput.uid || `usr-member-${Date.now()}`;
    const memberId = existing?.memberId || profileInput.memberId || this.generateUniqueMemberId();

    const merged: MemberProfileRecord = {
      uid,
      memberId,
      authEmail: existing?.authEmail || cleanEmail,
      fullName: cleanName,
      profilePhotograph: profileInput.profilePhotograph ?? existing?.profilePhotograph ?? '',
      dob: profileInput.dob ?? existing?.dob ?? '1992-01-01',
      gender: profileInput.gender ?? existing?.gender ?? 'prefer_not_to_say',
      occupation: profileInput.occupation ?? existing?.occupation ?? 'Foundation Supporter',
      email: cleanEmail,
      primaryMobile: cleanMobile,
      alternateMobile: profileInput.alternateMobile ?? existing?.alternateMobile ?? '',
      houseAndStreet: profileInput.houseAndStreet ?? existing?.houseAndStreet ?? 'Central Road',
      villageTownCity: profileInput.villageTownCity ?? existing?.villageTownCity ?? 'Kalyani',
      postOffice: profileInput.postOffice ?? existing?.postOffice ?? 'Kalyani HPO',
      policeStation: profileInput.policeStation ?? existing?.policeStation ?? 'Kalyani PS',
      district: profileInput.district ?? existing?.district ?? 'Nadia',
      state: profileInput.state ?? existing?.state ?? 'West Bengal',
      pinCode: profileInput.pinCode ?? existing?.pinCode ?? '741235',
      country: profileInput.country ?? existing?.country ?? 'India',
      membershipRegistrationDate:
        profileInput.membershipRegistrationDate ??
        existing?.membershipRegistrationDate ??
        nowIso.split('T')[0],
      memberCategory: profileInput.memberCategory ?? existing?.memberCategory ?? 'individual',
      areasOfInterest:
        profileInput.areasOfInterest ??
        existing?.areasOfInterest ?? [
          'Grassroots Youth Training (U-6 to U-12)',
          'Underprivileged Player Scholarships',
        ],
      preferredCommunicationMethod:
        profileInput.preferredCommunicationMethod ??
        existing?.preferredCommunicationMethod ??
        'email',
      emergencyContact: profileInput.emergencyContact ??
        existing?.emergencyContact ?? {
          name: '',
          relationship: '',
          phone: '',
        },
      accuracyConfirmed: profileInput.accuracyConfirmed ?? existing?.accuracyConfirmed ?? true,
      dataProcessingConsent:
        profileInput.dataProcessingConsent ?? existing?.dataProcessingConsent ?? true,
      promotionalUpdatesConsent:
        profileInput.promotionalUpdatesConsent ?? existing?.promotionalUpdatesConsent ?? true,
      profileCompletionStatus:
        profileInput.profileCompletionStatus ?? existing?.profileCompletionStatus ?? 'complete',
      completionPercentage: 100,
      currentWizardStep: 4,
      verifiedContactMetadata: profileInput.verifiedContactMetadata ??
        existing?.verifiedContactMetadata ?? {
          mobileNumber: cleanMobile,
          isVerified: Boolean(cleanMobile),
          verificationStatus: cleanMobile ? 'verified' : 'unverified',
          verifiedAt: cleanMobile ? nowIso : undefined,
          verifiedBy: cleanMobile ? adminActor.email : undefined,
          verificationMethod: 'admin_verified',
        },
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const completion = calculateProfileCompletion(merged);
    merged.completionPercentage =
      merged.profileCompletionStatus === 'complete' ? 100 : completion.percentage;

    const updatedList =
      existingIdx >= 0
        ? all.map((p, idx) => (idx === existingIdx ? merged : p))
        : [merged, ...all];

    writeStore(STORAGE_KEYS.MEMBER_PROFILES, updatedList, 'memberProfiles');

    this.recordAuditLog({
      actorUid: adminActor.uid,
      actorEmail: adminActor.email,
      actorRole: String(adminActor.role),
      action: existing ? 'ADMIN_UPDATED_MEMBER_PROFILE' : 'ADMIN_CREATED_MEMBER_PROFILE',
      targetType: 'member_profile',
      targetId: merged.memberId,
      details: `${existing ? 'Updated' : 'Created'} Member Profile for ${merged.fullName} (${merged.email}, ID: ${merged.memberId})`,
    });

    return { success: true, profile: merged };
  },

  adminDeleteMemberProfile(
    adminActor: { uid: string; email: string; role: UserRole | string },
    targetUid: string
  ): { success: boolean; error?: string } {
    if (!canManageDonations(adminActor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an Administrator can delete Member profiles.',
      };
    }

    const all = this.getAllMemberProfiles();
    const target = all.find((p) => p.uid === targetUid);
    if (!target) {
      return { success: false, error: 'Member profile not found.' };
    }

    const updated = all.filter((p) => p.uid !== targetUid);
    writeStore(STORAGE_KEYS.MEMBER_PROFILES, updated, 'memberProfiles');

    this.recordAuditLog({
      actorUid: adminActor.uid,
      actorEmail: adminActor.email,
      actorRole: String(adminActor.role),
      action: 'ADMIN_DELETED_MEMBER_PROFILE',
      targetType: 'member_profile',
      targetId: target.memberId,
      details: `Deleted Member Profile ${target.fullName} (${target.email}, ID: ${target.memberId})`,
    });

    return { success: true };
  },

  adminCreateManualDonationRecord(
    adminActor: { uid: string; email: string; role: UserRole | string },
    params: {
      uid: string;
      amount: number;
      frequency: DonationFrequency;
      purpose: string;
      paymentStatus: 'awaiting_payment' | 'submitted_for_verification' | 'verified';
      transactionReference?: string;
      paymentDate?: string;
    }
  ): { success: boolean; error?: string; donation?: DonationRecordItem } {
    if (!canManageDonations(adminActor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an Administrator can create manual donation records.',
      };
    }

    const member = this.getAllMemberProfiles().find((m) => m.uid === params.uid);
    if (!member) {
      return { success: false, error: 'Selected Member profile not found.' };
    }

    const cleanAmount = Math.round(Number(params.amount));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return { success: false, error: 'Please enter a valid positive donation amount in INR.' };
    }

    const settings = this.getPaymentSettings();
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const year = new Date().getFullYear();

    const allDonations = this.getAllDonations();
    const existingInvoiceNums = new Set(allDonations.map((d) => d.invoiceNumber));
    const existingReceiptNums = new Set(
      allDonations.map((d) => d.receiptNumber).filter(Boolean) as string[]
    );

    let invSeq = Math.max(settings.nextInvoiceSequence, 1001 + allDonations.length);
    let invoiceNumber = `${settings.invoicePrefix}-${year}-${String(invSeq).padStart(6, '0')}`;
    while (existingInvoiceNums.has(invoiceNumber)) {
      invSeq += 1;
      invoiceNumber = `${settings.invoicePrefix}-${year}-${String(invSeq).padStart(6, '0')}`;
    }

    let receiptNumber: string | undefined = undefined;
    let rcpSeq = Math.max(settings.nextReceiptSequence, 1001);
    if (params.paymentStatus === 'verified') {
      receiptNumber = `${settings.receiptPrefix}-${year}-${String(rcpSeq).padStart(6, '0')}`;
      while (existingReceiptNums.has(receiptNumber)) {
        rcpSeq += 1;
        receiptNumber = `${settings.receiptPrefix}-${year}-${String(rcpSeq).padStart(6, '0')}`;
      }
    }

    writeStore(
      STORAGE_KEYS.ORG_PAYMENT_SETTINGS,
      {
        ...settings,
        nextInvoiceSequence: invSeq + 1,
        nextReceiptSequence: params.paymentStatus === 'verified' ? rcpSeq + 1 : settings.nextReceiptSequence,
      },
      'organizationPaymentSettings'
    );

    const donationId = `MADEN-DON-${year}-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedAddress = [
      member.houseAndStreet,
      member.villageTownCity,
      member.postOffice ? `P.O. ${member.postOffice}` : '',
      member.district,
      member.state,
      member.pinCode,
      member.country,
    ]
      .filter(Boolean)
      .join(', ');

    const utr =
      params.transactionReference?.trim().toUpperCase() ||
      (params.paymentStatus === 'verified' ? `ADMIN-VERIFIED-${Date.now().toString().slice(-6)}` : undefined);

    const newDonation: DonationRecordItem = {
      donationId,
      uid: member.uid,
      memberId: member.memberId,
      donorName: member.fullName,
      donorEmail: member.email,
      donorAddress: formattedAddress,
      donorMobile: member.primaryMobile,
      invoiceNumber,
      receiptNumber,
      amount: cleanAmount,
      amountInWords: numberToIndianRupeeWords(cleanAmount),
      currency: 'INR',
      frequency: params.frequency,
      purpose: params.purpose.trim() || 'Grassroots Youth Training & Player Scholarships',
      paymentMethod: 'official_qr_upi',
      transactionReference: utr,
      paymentDate: params.paymentDate || todayStr,
      paymentStatus: params.paymentStatus,
      mobileVerificationStatus: member.verifiedContactMetadata?.isVerified ? 'verified' : 'unverified',
      verifiedBy: params.paymentStatus === 'verified' ? adminActor.email : undefined,
      verifiedAt: params.paymentStatus === 'verified' ? nowIso : undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    writeStore(STORAGE_KEYS.DONATIONS, [newDonation, ...allDonations], 'donations');

    this.recordAuditLog({
      actorUid: adminActor.uid,
      actorEmail: adminActor.email,
      actorRole: String(adminActor.role),
      action: 'ADMIN_CREATED_DONATION_RECORD',
      targetType: 'donation',
      targetId: donationId,
      details: `Created donation ${donationId} (₹${cleanAmount.toLocaleString('en-IN')}, Status: ${params.paymentStatus}${receiptNumber ? `, Receipt: ${receiptNumber}` : ''}) for Member ${member.fullName} (${member.memberId}).`,
    });

    this.createNotification({
      uid: member.uid,
      memberId: member.memberId,
      title:
        params.paymentStatus === 'verified'
          ? `Official Donation Receipt Issued (${receiptNumber})`
          : `New Contribution Invoice Recorded (${invoiceNumber})`,
      message:
        params.paymentStatus === 'verified'
          ? `Your contribution of ₹${cleanAmount.toLocaleString('en-IN')} has been recorded and verified by MADEN FAF Administration. Official Receipt ${receiptNumber} is ready for download.`
          : `A contribution record of ₹${cleanAmount.toLocaleString('en-IN')} (${params.frequency}) has been generated under Reference ${donationId}.`,
      category: params.paymentStatus === 'verified' ? 'receipt' : 'payment',
      relatedDonationId: donationId,
    });

    return { success: true, donation: newDonation };
  },

  adminUpdateDonationPlan(
    adminActor: { uid: string; email: string; role: UserRole | string },
    planId: string,
    updates: {
      amount?: number;
      frequency?: DonationFrequency;
      status?: 'active' | 'paused' | 'cancelled';
      nextSuggestedPaymentDate?: string;
      purpose?: string;
      reminderEnabled?: boolean;
    }
  ): { success: boolean; error?: string; plan?: DonationPlanRecord } {
    if (!canManageDonations(adminActor.role)) {
      return {
        success: false,
        error: 'Unauthorized: Only an Administrator can modify Member contribution plans.',
      };
    }

    const allPlans = this.getAllDonationPlans();
    const idx = allPlans.findIndex((p) => p.planId === planId);
    if (idx === -1) {
      return { success: false, error: 'Contribution plan not found.' };
    }

    const current = allPlans[idx];
    const updated: DonationPlanRecord = {
      ...current,
      amount: updates.amount !== undefined ? Math.round(Number(updates.amount)) : current.amount,
      frequency: updates.frequency || current.frequency,
      status: updates.status || current.status,
      nextSuggestedPaymentDate:
        updates.nextSuggestedPaymentDate || current.nextSuggestedPaymentDate,
      purpose: updates.purpose !== undefined ? updates.purpose : current.purpose,
      reminderEnabled:
        updates.reminderEnabled !== undefined ? updates.reminderEnabled : current.reminderEnabled,
      updatedAt: new Date().toISOString(),
    };

    allPlans[idx] = updated;
    writeStore(STORAGE_KEYS.DONATION_PLANS, [...allPlans], 'donationPlans');

    this.recordAuditLog({
      actorUid: adminActor.uid,
      actorEmail: adminActor.email,
      actorRole: String(adminActor.role),
      action: 'ADMIN_UPDATED_DONATION_PLAN',
      targetType: 'donation',
      targetId: planId,
      details: `Updated Plan ${planId} for ${current.donorName} (${current.memberId}): ₹${updated.amount.toLocaleString('en-IN')} / ${updated.frequency} [${updated.status}]`,
    });

    return { success: true, plan: updated };
  },

  adminSendMemberNotification(
    adminActor: { uid: string; email: string; role: UserRole | string },
    params: {
      targetUid: string | 'ALL_MEMBERS';
      title: string;
      message: string;
      category?: DonorPortalNotification['category'];
    }
  ): { success: boolean; count: number; error?: string } {
    if (!canManageDonations(adminActor.role)) {
      return {
        success: false,
        count: 0,
        error: 'Unauthorized: Only an Administrator can dispatch Member Portal notifications.',
      };
    }

    if (!params.title.trim() || !params.message.trim()) {
      return {
        success: false,
        count: 0,
        error: 'Please enter both a notification title and message.',
      };
    }

    const allMembers = this.getAllMemberProfiles();
    const targets =
      params.targetUid === 'ALL_MEMBERS'
        ? allMembers
        : allMembers.filter((m) => m.uid === params.targetUid);

    if (targets.length === 0) {
      return { success: false, count: 0, error: 'No target Member profiles found.' };
    }

    const allNotifs = readStore<DonorPortalNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const nowIso = new Date().toISOString();
    const createdItems: DonorPortalNotification[] = targets.map((m, i) => ({
      id: `notif-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
      uid: m.uid,
      memberId: m.memberId,
      title: params.title.trim(),
      message: params.message.trim(),
      category: params.category || 'profile',
      isRead: false,
      createdAt: nowIso,
    }));

    writeStore(STORAGE_KEYS.NOTIFICATIONS, [...createdItems, ...allNotifs], 'notifications');

    this.recordAuditLog({
      actorUid: adminActor.uid,
      actorEmail: adminActor.email,
      actorRole: String(adminActor.role),
      action:
        params.targetUid === 'ALL_MEMBERS'
          ? 'ADMIN_BROADCAST_MEMBER_NOTIFICATION'
          : 'ADMIN_SENT_MEMBER_NOTIFICATION',
      targetType: 'member_profile',
      targetId: params.targetUid,
      details: `Sent notification "${params.title.trim()}" to ${targets.length} Member(s).`,
    });

    return { success: true, count: targets.length };
  },
};
