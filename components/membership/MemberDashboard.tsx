'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { UserProfile, useAuth } from '@/lib/AuthContext';
import {
  DonatorsPortalService,
  subscribeDonatorsPortal,
  MemberProfileRecord,
  DonationFrequency,
  DonationRecordItem,
  MemberCategory,
  maskIndianMobile,
  isValidIndianMobile,
  isValidEmailAddress,
  isValidIndianPinCode,
  calculateProfileCompletion,
  DEFAULT_ORG_PAYMENT_SETTINGS,
} from '@/lib/donatorsPortalService';
import { DonationDocumentViewer, DocumentViewMode } from './DonationDocumentViewer';
import {
  downloadDonationPdf,
  downloadAnnualVerifiedStatementPdf,
} from '@/lib/pdfDocumentGenerator';
import {
  LayoutDashboard,
  User,
  Edit3,
  HeartHandshake,
  CalendarClock,
  History,
  Clock,
  ShieldCheck,
  FileText,
  Download,
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Phone,
  Upload,
  XCircle,
  Info,
  Printer,
  Eye,
  Plus,
  PauseCircle,
  PlayCircle,
  Ban,
  Search,
} from 'lucide-react';

export type MemberDashboardSection =
  | 'overview'
  | 'my_profile'
  | 'edit_profile'
  | 'make_donation'
  | 'my_plans'
  | 'donation_history'
  | 'pending_payments'
  | 'verification_status'
  | 'invoices_receipts'
  | 'download_documents'
  | 'notifications'
  | 'account_settings';

interface MemberDashboardProps {
  profile: UserProfile;
}

const FOOTBALL_INTEREST_AREAS = [
  'Grassroots Youth Training (U-6 to U-12)',
  'Underprivileged Player Scholarships',
  'Girls & Women Football Development',
  'Sports Nutrition & Medical Welfare',
  'Campus Infrastructure & Turf Equipment',
  'Youth Tournament & Exposure Travel',
];

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ profile }) => {
  const { logout } = useAuth();

  // Hydrate cloud state once on mount
  useEffect(() => {
    DonatorsPortalService.hydrateFromCloud();
  }, []);

  // Subscribe to DonatorsPortalService store
  const portalTick = useSyncExternalStore(
    subscribeDonatorsPortal,
    () => {
      if (typeof window === 'undefined') return 'server';
      return (
        (localStorage.getItem('maden_faf_donor_member_profiles_v1') || '') +
        (localStorage.getItem('maden_faf_donations_ledger_v1') || '') +
        (localStorage.getItem('maden_faf_donor_plans_v1') || '') +
        (localStorage.getItem('maden_faf_payment_submissions_v1') || '') +
        (localStorage.getItem('maden_faf_org_payment_settings_v1') || '') +
        (localStorage.getItem('maden_faf_donor_notifications_v1') || '')
      );
    },
    () => 'server'
  );

  // Read live member data scoped strictly to logged-in user (profile.id)
  const settings = React.useMemo(
    () => DonatorsPortalService.getPaymentSettings() || DEFAULT_ORG_PAYMENT_SETTINGS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick]
  );

  const portalModuleConfig = settings.portalModuleConfig || DEFAULT_ORG_PAYMENT_SETTINGS.portalModuleConfig;

  const memberRecord = React.useMemo(
    () => DonatorsPortalService.getMemberProfileByUid(profile.id, profile.email, profile.fullName),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick, profile.id, profile.email, profile.fullName]
  );

  const myDonations = React.useMemo(
    () => DonatorsPortalService.getMemberDonations(profile.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick, profile.id]
  );

  const myPlans = React.useMemo(
    () => DonatorsPortalService.getMemberDonationPlans(profile.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick, profile.id]
  );

  const mySubmissions = React.useMemo(
    () => DonatorsPortalService.getMemberPaymentSubmissions(profile.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick, profile.id]
  );

  const myNotifications = React.useMemo(
    () => DonatorsPortalService.getMemberNotifications(profile.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick, profile.id]
  );

  // If member profile is not yet complete on first login, guide them to the 4-step wizard
  const [activeSection, setActiveSection] = useState<MemberDashboardSection>(() =>
    memberRecord.profileCompletionStatus === 'complete' ? 'overview' : 'edit_profile'
  );

  // Wizard state for Section 4 (Member Profile Creation & Edit)
  const [wizardForm, setWizardForm] = useState<MemberProfileRecord>(memberRecord);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(
    memberRecord.currentWizardStep || 1
  );
  const [profileBanner, setProfileBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Listen for "See Your Digital Profile" CTA click from portal header
  useEffect(() => {
    const handleOpenProfile = () => {
      setActiveSection('my_profile');
    };
    window.addEventListener('maden-open-member-profile', handleOpenProfile);
    return () => {
      window.removeEventListener('maden-open-member-profile', handleOpenProfile);
    };
  }, []);

  // Donation Selection state (Section 6)
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(
    settings.presetAmounts[1] || 1000
  );
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<DonationFrequency>('monthly');
  const [donationPurpose, setDonationPurpose] = useState<string>(
    'Grassroots Youth Training & Player Scholarships'
  );
  const [planConfirmedCheckbox, setPlanConfirmedCheckbox] = useState<boolean>(false);
  const [donationFormNotice, setDonationFormNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Active Donation selected for Official QR Payment & Confirmation (Section 7)
  const [activePaymentDonationId, setActivePaymentDonationId] = useState<string>('');
  const [utrInput, setUtrInput] = useState<string>('');
  const [paymentDateInput, setPaymentDateInput] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [paymentMobileInput, setPaymentMobileInput] = useState<string>(
    memberRecord.primaryMobile || ''
  );
  const [paymentDonorNameInput, setPaymentDonorNameInput] = useState<string>(
    memberRecord.fullName || profile.fullName
  );
  const [paymentScreenshotDataUrl, setPaymentScreenshotDataUrl] = useState<string>('');
  const [paymentScreenshotName, setPaymentScreenshotName] = useState<string>('');
  const [paymentDeclarationChecked, setPaymentDeclarationChecked] = useState<boolean>(false);
  const [paymentFeedback, setPaymentFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Mobile Confirmation state (Section 8)
  const [mobileToConfirm, setMobileToConfirm] = useState<string>(
    memberRecord.primaryMobile || ''
  );
  const [mobileFeedback, setMobileFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Plan Edit state (Section 11)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanAmount, setEditPlanAmount] = useState<string>('');
  const [editPlanFrequency, setEditPlanFrequency] = useState<DonationFrequency>('monthly');
  const [planFeedback, setPlanFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // History filter & search
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Document Viewer modal state (Section 9 & 10)
  const [docModalState, setDocModalState] = useState<{
    donation: DonationRecordItem;
    mode: DocumentViewMode;
  } | null>(null);

  // Derived metrics (Section 5: ONLY count verified payments as successfully received donations!)
  const verifiedDonations = myDonations.filter((d) => d.paymentStatus === 'verified');
  const totalVerifiedAmount = verifiedDonations.reduce((acc, d) => acc + d.amount, 0);
  const totalVerifiedCount = verifiedDonations.length;

  const pendingVerificationDonations = myDonations.filter(
    (d) => d.paymentStatus === 'submitted_for_verification'
  );
  const awaitingPaymentDonations = myDonations.filter(
    (d) => d.paymentStatus === 'awaiting_payment' || d.paymentStatus === 'rejected'
  );
  const pendingVerificationCount = pendingVerificationDonations.length;
  const awaitingPaymentCount = awaitingPaymentDonations.length;

  const activePlan = myPlans.find((p) => p.status === 'active') || myPlans[0] || null;
  const unreadNotificationsCount = myNotifications.filter((n) => !n.isRead).length;

  // Select default pending donation for QR payment page
  const selectedPaymentDonation = React.useMemo(() => {
    if (activePaymentDonationId) {
      const found = myDonations.find((d) => d.donationId === activePaymentDonationId);
      if (found) return found;
    }
    return awaitingPaymentDonations[0] || myDonations[0] || null;
  }, [activePaymentDonationId, awaitingPaymentDonations, myDonations]);

  const effectivePaidAmountValue =
    paidAmountInput !== ''
      ? paidAmountInput
      : selectedPaymentDonation
      ? String(selectedPaymentDonation.amount)
      : '';
  const effectivePaymentMobileValue =
    paymentMobileInput !== '' ? paymentMobileInput : memberRecord.primaryMobile || '';
  const effectivePaymentDonorNameValue =
    paymentDonorNameInput !== ''
      ? paymentDonorNameInput
      : memberRecord.fullName || profile.fullName;
  const effectiveMobileToConfirmValue =
    mobileToConfirm !== '' ? mobileToConfirm : memberRecord.primaryMobile || '';

  // ---------------- HANDLERS ---------------- //

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setProfileBanner({
        type: 'error',
        text: 'Profile photograph must be a JPG, PNG, or WEBP image.',
      });
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setProfileBanner({
        type: 'error',
        text: 'Profile photograph must be under 1.5 MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setWizardForm((prev) => ({ ...prev, profilePhotograph: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPaymentFeedback({
        type: 'error',
        text: 'Payment screenshot must be a PNG, JPG, or WEBP image file.',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPaymentFeedback({
        type: 'error',
        text: 'Screenshot file size must not exceed 2 MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPaymentScreenshotDataUrl(reader.result);
        setPaymentScreenshotName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateWizardStep = (step: 1 | 2 | 3 | 4): string | null => {
    if (step === 1) {
      if (!wizardForm.fullName.trim()) return 'Full Name is required.';
      if (!wizardForm.dob.trim()) return 'Date of Birth is required.';
      if (!wizardForm.occupation.trim()) return 'Occupation is required.';
      if (!wizardForm.email.trim() || !isValidEmailAddress(wizardForm.email)) {
        return 'Please enter a valid Email Address.';
      }
      if (!wizardForm.primaryMobile.trim() || !isValidIndianMobile(wizardForm.primaryMobile)) {
        return 'Please enter a valid 10-digit Indian Primary Mobile Number.';
      }
      if (
        wizardForm.alternateMobile?.trim() &&
        !isValidIndianMobile(wizardForm.alternateMobile)
      ) {
        return 'Alternate Mobile Number must be a valid 10-digit Indian mobile number.';
      }
    }
    if (step === 2) {
      if (!wizardForm.houseAndStreet.trim()) return 'House Number and Street is required.';
      if (!wizardForm.villageTownCity.trim()) return 'Village / Town / City is required.';
      if (!wizardForm.postOffice.trim()) return 'Post Office is required.';
      if (!wizardForm.district.trim()) return 'District is required.';
      if (!wizardForm.state.trim()) return 'State is required.';
      if (!wizardForm.pinCode.trim() || !isValidIndianPinCode(wizardForm.pinCode)) {
        return 'Please enter a valid 6-digit Indian PIN Code.';
      }
      if (!wizardForm.country.trim()) return 'Country is required.';
    }
    if (step === 3) {
      if (!wizardForm.memberCategory) return 'Member Category is required.';
      if (!wizardForm.preferredCommunicationMethod) {
        return 'Preferred Communication Method is required.';
      }
    }
    if (step === 4) {
      if (!wizardForm.accuracyConfirmed) {
        return 'Please confirm that the submitted information is accurate.';
      }
      if (!wizardForm.dataProcessingConsent) {
        return 'Please provide consent for membership and donation administration data processing.';
      }
    }
    return null;
  };

  const handleSaveProfileDraft = () => {
    setProfileBanner(null);
    const res = DonatorsPortalService.saveMemberProfile(
      profile.id,
      { ...wizardForm, currentWizardStep: wizardStep },
      true
    );
    if (res.success) {
      setProfileBanner({
        type: 'success',
        text: `Draft saved at Step ${wizardStep}. You can resume your profile at any time.`,
      });
    } else {
      setProfileBanner({ type: 'error', text: res.error || 'Could not save draft.' });
    }
  };

  const handleNextWizardStep = () => {
    setProfileBanner(null);
    const err = validateWizardStep(wizardStep);
    if (err) {
      setProfileBanner({ type: 'error', text: err });
      return;
    }
    const nextStep = Math.min(4, wizardStep + 1) as 1 | 2 | 3 | 4;
    // Save progress as draft automatically when advancing
    DonatorsPortalService.saveMemberProfile(
      profile.id,
      { ...wizardForm, currentWizardStep: nextStep },
      true
    );
    setWizardStep(nextStep);
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileBanner(null);
    for (const s of [1, 2, 3, 4] as const) {
      const err = validateWizardStep(s);
      if (err) {
        setWizardStep(s);
        setProfileBanner({ type: 'error', text: `Step ${s}: ${err}` });
        return;
      }
    }

    const res = DonatorsPortalService.saveMemberProfile(
      profile.id,
      { ...wizardForm, currentWizardStep: 4 },
      false
    );
    if (res.success) {
      setProfileBanner({
        type: 'success',
        text: 'Member Profile completed! Redirecting to your Donators Portal Overview...',
      });
      setTimeout(() => {
        setActiveSection('overview');
        setProfileBanner(null);
      }, 700);
    } else {
      setProfileBanner({ type: 'error', text: res.error || 'Failed to save profile.' });
    }
  };

  const effectiveDonationAmount =
    selectedPreset === 'custom'
      ? Math.round(Number(customAmountInput) || 0)
      : selectedPreset;

  const handleCreateDonationPlanAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationFormNotice(null);

    if (memberRecord.profileCompletionStatus !== 'complete') {
      setDonationFormNotice({
        type: 'error',
        text: 'Please complete your 4-step Member Profile before initiating a contribution.',
      });
      return;
    }

    if (!planConfirmedCheckbox) {
      setDonationFormNotice({
        type: 'error',
        text: 'Please explicitly confirm the selected contribution amount and frequency before proceeding to payment.',
      });
      return;
    }

    const res = DonatorsPortalService.createDonationAndCommitmentPlan({
      uid: profile.id,
      amount: effectiveDonationAmount,
      frequency: selectedFrequency,
      purpose: donationPurpose,
    });

    if (!res.success || !res.donation) {
      setDonationFormNotice({
        type: 'error',
        text: res.error || 'Failed to create donation record.',
      });
      return;
    }

    setActivePaymentDonationId(res.donation.donationId);
    setPaidAmountInput(String(res.donation.amount));
    setPlanConfirmedCheckbox(false);
    setPaymentFeedback(null);
    setActiveSection('pending_payments');
  };

  const handleSubmitPaymentConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentFeedback(null);

    if (!selectedPaymentDonation) {
      setPaymentFeedback({
        type: 'error',
        text: 'Please select a pending donation invoice first.',
      });
      return;
    }

    const res = DonatorsPortalService.submitPaymentConfirmation({
      uid: profile.id,
      donationId: selectedPaymentDonation.donationId,
      donorName: effectivePaymentDonorNameValue,
      registeredMobile: effectivePaymentMobileValue,
      transactionReference: utrInput,
      paymentDate: paymentDateInput,
      submittedAmount: Number(effectivePaidAmountValue),
      evidenceFileReference: paymentScreenshotDataUrl || undefined,
      declarationAccepted: paymentDeclarationChecked,
    });

    if (res.success) {
      setUtrInput('');
      setPaymentScreenshotDataUrl('');
      setPaymentScreenshotName('');
      setPaymentDeclarationChecked(false);
      setPaymentFeedback({
        type: 'success',
        text: 'Payment confirmation submitted! Status is now "Submitted for Verification". Official receipt will be unlocked once verified by MADEN FAF Administration.',
      });
    } else {
      setPaymentFeedback({
        type: 'error',
        text: res.error || 'Could not submit payment confirmation.',
      });
    }
  };

  const handleRequestMobileConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileFeedback(null);
    const res = DonatorsPortalService.requestMobileVerificationConfirmation(
      profile.id,
      effectiveMobileToConfirmValue
    );
    if (res.success) {
      setMobileFeedback({ type: 'success', text: res.message });
    } else {
      setMobileFeedback({
        type: 'error',
        text: res.error || 'Mobile confirmation request failed.',
      });
    }
  };

  const handleDownloadQrImage = () => {
    if (!settings.officialQrCodeUrl) return;
    const a = document.createElement('a');
    a.href = settings.officialQrCodeUrl;
    a.download = 'MADEN-FAF-Official-Donation-QR.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const navItems: {
    id: MemberDashboardSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    badgeCount?: number;
  }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'my_profile', label: 'My Profile', icon: User },
    { id: 'edit_profile', label: 'Edit Profile', icon: Edit3 },
    { id: 'make_donation', label: 'Make a Donation', icon: HeartHandshake },
    { id: 'my_plans', label: 'My Donation Plans', icon: CalendarClock },
    { id: 'donation_history', label: 'Donation History', icon: History },
    {
      id: 'pending_payments',
      label: 'Pending Payments',
      icon: QrCode,
      badgeCount: awaitingPaymentDonations.length || undefined,
    },
    {
      id: 'verification_status',
      label: 'Payment Verification Status',
      icon: ShieldCheck,
      badgeCount: pendingVerificationDonations.length || undefined,
    },
    { id: 'invoices_receipts', label: 'Invoices and Receipts', icon: FileText },
    { id: 'download_documents', label: 'Download Documents', icon: Download },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badgeCount: unreadNotificationsCount || undefined,
    },
    { id: 'account_settings', label: 'Account Settings', icon: Settings },
  ];

  const completionCheck = calculateProfileCompletion(wizardForm);

  return (
    <div className="space-y-6">
      {/* Top Member Summary Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-amber-400 font-medium flex flex-wrap items-center gap-2">
            <span>{portalModuleConfig.portalHeadline || 'MADEN FAF Donators Portal'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Member ID: {memberRecord.memberId}</span>
            <span aria-hidden="true">·</span>
            <span>
              Profile: {memberRecord.completionPercentage}% ({memberRecord.profileCompletionStatus})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Welcome, {memberRecord.fullName || profile.fullName}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            {portalModuleConfig.portalSubheadline ||
              'Manage your Foundation Member profile, recurring contribution plans, official QR transfers, mobile confirmation, and verified donation receipts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('make_donation')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Make a Donation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('invoices_receipts')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Invoices &amp; Receipts</span>
          </button>
        </div>
      </div>

      {portalModuleConfig.portalAnnouncementBanner && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">{portalModuleConfig.portalAnnouncementBanner}</span>
        </div>
      )}

      {!portalModuleConfig.moduleEnabled && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>
            New contributions are temporarily paused by Foundation Administration for scheduled maintenance. Your existing donation records and official tax receipts remain available below.
          </span>
        </div>
      )}

      {/* Incomplete Profile Alert Banner */}
      {memberRecord.profileCompletionStatus !== 'complete' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">
                Action Required: Complete Your 4-Step Member Profile ({memberRecord.completionPercentage}% Complete)
              </div>
              <p className="text-amber-800 mt-0.5">
                Please complete all required fields in the profile wizard to unlock donation plan creation and official receipt generation. Your progress is automatically saved as a draft.
              </p>
            </div>
          </div>
          {activeSection !== 'edit_profile' && (
            <button
              type="button"
              onClick={() => setActiveSection('edit_profile')}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              Resume Profile Wizard
            </button>
          )}
        </div>
      )}

      {/* Workspace Layout: Sidebar Navigation + Main Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop & Mobile Navigation Column */}
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-100 mb-1">
            Donators Portal Menu
          </div>

          {/* Mobile/Tablet Quick Dropdown */}
          <div className="block lg:hidden p-1 pb-2">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value as MemberDashboardSection)}
              aria-label="Select Donators Portal Section"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                  {item.badgeCount ? ` (${item.badgeCount})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Sidebar Links */}
          <nav className="hidden lg:block space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span
                      className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 text-slate-700 font-semibold'
                      }`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Viewport */}
        <main className="lg:col-span-9 space-y-6">
          {/* ============================================================== */}
          {/* 1. DASHBOARD OVERVIEW                                          */}
          {/* ============================================================== */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* 7 Mandatory Summary Cards (Section 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">Member ID</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {memberRecord.memberId}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize">
                    Category: {memberRecord.memberCategory.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">Profile Completion</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {memberRecord.completionPercentage}%
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Status:{' '}
                    <span className="font-semibold capitalize text-slate-700">
                      {memberRecord.profileCompletionStatus}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">Total Verified Donations</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                    ₹{totalVerifiedAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Verified payments only
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">Verified Contributions</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {totalVerifiedCount}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Official receipts issued
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 sm:col-span-2">
                  <div className="text-xs text-slate-500">Current Donation Plan</div>
                  {activePlan ? (
                    <>
                      <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                        ₹{activePlan.amount.toLocaleString('en-IN')} per{' '}
                        {activePlan.frequency === 'monthly'
                          ? 'month'
                          : activePlan.frequency === 'quarterly'
                          ? 'quarter'
                          : 'year'}{' '}
                        <span className="text-xs font-sans font-normal text-slate-500 capitalize">
                          ({activePlan.status})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Purpose: {activePlan.purpose}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-slate-700">
                        No Active Contribution Plan
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Choose a monthly, quarterly, or yearly plan to begin.
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">Next Scheduled Contribution</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                    {activePlan && activePlan.status === 'active'
                      ? activePlan.nextSuggestedPaymentDate
                      : 'Not Scheduled'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Manual QR reminder commitment
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="text-xs text-slate-500">Pending Verification</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-amber-700">
                    {pendingVerificationDonations.length}
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    Awaiting Payment: {awaitingPaymentDonations.length}
                  </div>
                </div>
              </div>

              {/* Recent Donations Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Recent Contributions &amp; Verification Ledger
                    </h2>
                    <p className="text-xs text-slate-500">
                      Only verified payments count toward total donations and unlock official receipts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('make_donation')}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap self-start sm:self-auto"
                  >
                    + New Contribution
                  </button>
                </div>

                {myDonations.length === 0 ? (
                  <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="text-sm font-semibold text-slate-800">
                      No Donations Recorded Yet
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Support grassroots youth training and academy scholarships by selecting a monthly, quarterly, or yearly contribution plan.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection('make_donation')}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs cursor-pointer"
                    >
                      Make Your First Donation
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2.5 px-3 font-medium">Reference / Date</th>
                          <th className="py-2.5 px-3 font-medium">Frequency &amp; Purpose</th>
                          <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                          <th className="py-2.5 px-3 font-medium">Status</th>
                          <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {myDonations.slice(0, 6).map((d) => (
                          <tr key={d.donationId} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3">
                              <div className="font-mono font-semibold text-slate-900 tabular-nums">
                                {d.donationId}
                              </div>
                              <div className="text-[11px] text-slate-500 tabular-nums">
                                {new Date(d.createdAt).toLocaleDateString('en-IN')} · {d.invoiceNumber}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium capitalize text-slate-800">
                                {d.frequency} Contribution
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                {d.purpose}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                              ₹{d.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`font-semibold capitalize ${
                                  d.paymentStatus === 'verified'
                                    ? 'text-emerald-700'
                                    : d.paymentStatus === 'submitted_for_verification'
                                    ? 'text-amber-700'
                                    : d.paymentStatus === 'rejected' || d.paymentStatus === 'refunded'
                                    ? 'text-rose-700'
                                    : 'text-slate-600'
                                }`}
                              >
                                {d.paymentStatus.replace(/_/g, ' ')}
                              </span>
                              {d.rejectionReason && d.paymentStatus === 'rejected' && (
                                <div className="text-[11px] text-rose-600 mt-0.5">
                                  Note: {d.rejectionReason}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                              {(d.paymentStatus === 'awaiting_payment' ||
                                d.paymentStatus === 'rejected') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePaymentDonationId(d.donationId);
                                    setActiveSection('pending_payments');
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-[11px] cursor-pointer"
                                >
                                  {d.paymentStatus === 'rejected' ? 'Resubmit UTR' : 'Pay / Submit UTR'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setDocModalState({ donation: d, mode: 'invoice' })}
                                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer"
                              >
                                Invoice
                              </button>
                              {d.paymentStatus === 'verified' && d.receiptNumber && (
                                <button
                                  type="button"
                                  onClick={() => setDocModalState({ donation: d, mode: 'receipt' })}
                                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] cursor-pointer"
                                >
                                  Receipt
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. MY PROFILE (READ-ONLY VIEW)                                 */}
          {/* ============================================================== */}
          {activeSection === 'my_profile' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center text-xl font-bold overflow-hidden border border-slate-800 shrink-0">
                    {memberRecord.profilePhotograph ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={memberRecord.profilePhotograph}
                        alt={memberRecord.fullName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      memberRecord.fullName.charAt(0) || 'M'
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{memberRecord.fullName}</h2>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-mono font-semibold text-slate-800 tabular-nums">
                        {memberRecord.memberId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">
                        {memberRecord.memberCategory.replace(/_/g, ' ')} Member
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Completion: {memberRecord.completionPercentage}%</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection('edit_profile')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    01. Personal Information
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Full Name:</span>
                    <span className="font-medium text-slate-900">{memberRecord.fullName || '—'}</span>
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {memberRecord.dob || '—'}
                    </span>
                    <span className="text-slate-500">Gender:</span>
                    <span className="capitalize text-slate-900">
                      {memberRecord.gender ? memberRecord.gender.replace(/_/g, ' ') : 'Not specified'}
                    </span>
                    <span className="text-slate-500">Occupation:</span>
                    <span className="text-slate-900">{memberRecord.occupation || '—'}</span>
                    <span className="text-slate-500">Contact Email:</span>
                    <span className="text-slate-900 truncate">{memberRecord.email || '—'}</span>
                    <span className="text-slate-500">Verified Auth Email:</span>
                    <span className="font-mono text-slate-700 truncate">
                      {memberRecord.authEmail || profile.email}
                    </span>
                    <span className="text-slate-500">Primary Mobile:</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {memberRecord.primaryMobile ? `+91 ${memberRecord.primaryMobile}` : '—'}
                    </span>
                    <span className="text-slate-500">Alternate Mobile:</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {memberRecord.alternateMobile ? `+91 ${memberRecord.alternateMobile}` : '—'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    02. Address Information
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">House &amp; Street:</span>
                    <span className="text-slate-900">{memberRecord.houseAndStreet || '—'}</span>
                    <span className="text-slate-500">Village / Town / City:</span>
                    <span className="text-slate-900">{memberRecord.villageTownCity || '—'}</span>
                    <span className="text-slate-500">Post Office:</span>
                    <span className="text-slate-900">{memberRecord.postOffice || '—'}</span>
                    <span className="text-slate-500">Police Station:</span>
                    <span className="text-slate-900">{memberRecord.policeStation || '—'}</span>
                    <span className="text-slate-500">District &amp; State:</span>
                    <span className="text-slate-900">
                      {[memberRecord.district, memberRecord.state].filter(Boolean).join(', ') || '—'}
                    </span>
                    <span className="text-slate-500">PIN Code &amp; Country:</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {[memberRecord.pinCode, memberRecord.country].filter(Boolean).join(', ') || '—'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    03. Membership Information
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Member ID:</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-900">
                      {memberRecord.memberId}
                    </span>
                    <span className="text-slate-500">Registration Date:</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      {memberRecord.membershipRegistrationDate}
                    </span>
                    <span className="text-slate-500">Member Category:</span>
                    <span className="capitalize text-slate-900">
                      {memberRecord.memberCategory.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-500">Preferred Contact:</span>
                    <span className="uppercase text-slate-900">
                      {memberRecord.preferredCommunicationMethod}
                    </span>
                  </div>
                  {memberRecord.areasOfInterest?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/70">
                      <div className="text-slate-500 mb-1">Areas of Interest:</div>
                      <div className="text-slate-800">{memberRecord.areasOfInterest.join(' · ')}</div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    04. Declarations &amp; Verification Status
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Accuracy Declaration:</span>
                      <span className="font-semibold text-slate-900">
                        {memberRecord.accuracyConfirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Data Processing Consent:</span>
                      <span className="font-semibold text-slate-900">
                        {memberRecord.dataProcessingConsent ? 'Consented' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Academy News Updates (Optional):</span>
                      <span className="text-slate-800">
                        {memberRecord.promotionalUpdatesConsent ? 'Opted In' : 'Opted Out'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                      <span className="text-slate-500">Mobile Verification:</span>
                      <span className="font-semibold capitalize text-slate-900">
                        {memberRecord.verifiedContactMetadata?.verificationStatus?.replace(
                          /_/g,
                          ' '
                        ) || 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. EDIT PROFILE (4-STEP GUIDED WIZARD — SECTION 4)             */}
          {/* ============================================================== */}
          {activeSection === 'edit_profile' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Member Profile Wizard (Step {wizardStep} of 4)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Complete all 4 steps to maintain your verified Member dossier. You can save a draft at any point.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tabular-nums text-slate-600">
                    Completion: <strong>{completionCheck.percentage}%</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveProfileDraft}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer"
                  >
                    Save Draft
                  </button>
                </div>
              </div>

              {/* 4-Step Progress Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { step: 1, title: '01. Personal Info' },
                  { step: 2, title: '02. Address Info' },
                  { step: 3, title: '03. Membership' },
                  { step: 4, title: '04. Consent' },
                ].map((item) => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setWizardStep(item.step as 1 | 2 | 3 | 4)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-colors cursor-pointer ${
                      wizardStep === item.step
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {profileBanner && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                    profileBanner.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {profileBanner.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{profileBanner.text}</span>
                </div>
              )}

              <form onSubmit={handleCompleteProfile} className="space-y-5">
                {/* STEP 1 — PERSONAL INFORMATION */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Step 1 — Personal Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.fullName}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, fullName: e.target.value })
                          }
                          placeholder="Enter your full legal name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Date of Birth <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={wizardForm.dob}
                          onChange={(e) => setWizardForm({ ...wizardForm, dob: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gender (Optional)
                        </label>
                        <select
                          value={wizardForm.gender || ''}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, gender: e.target.value as any })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                        >
                          <option value="">Select gender (optional)</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Occupation <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.occupation}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, occupation: e.target.value })
                          }
                          placeholder="e.g. Engineer, Educator, Business Owner"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={wizardForm.email}
                          onChange={(e) => setWizardForm({ ...wizardForm, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                        <div className="text-[11px] text-slate-500 mt-1">
                          Authenticated Login Email (preserved):{' '}
                          <span className="font-mono">{wizardForm.authEmail || profile.email}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Primary Mobile Number (10-digit Indian) <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={wizardForm.primaryMobile}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              primaryMobile: e.target.value.replace(/\D/g, '').slice(0, 10),
                            })
                          }
                          placeholder="9830XXXXXX"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono tabular-nums"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Alternate Mobile Number (Optional)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={wizardForm.alternateMobile || ''}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              alternateMobile: e.target.value.replace(/\D/g, '').slice(0, 10),
                            })
                          }
                          placeholder="Optional 10-digit number"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono tabular-nums"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Profile Photograph (JPG/PNG/WEBP, max 1.5MB)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose Photo</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                          {wizardForm.profilePhotograph && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Photo attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 — ADDRESS INFORMATION */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Step 2 — Address Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          House Number and Street <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.houseAndStreet}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, houseAndStreet: e.target.value })
                          }
                          placeholder="House/Flat No., Street, Locality"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Village / Town / City <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.villageTownCity}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, villageTownCity: e.target.value })
                          }
                          placeholder="e.g. Kalyani"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Post Office <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.postOffice}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, postOffice: e.target.value })
                          }
                          placeholder="Post Office name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Police Station (Optional)
                        </label>
                        <input
                          type="text"
                          value={wizardForm.policeStation || ''}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, policeStation: e.target.value })
                          }
                          placeholder="Optional Police Station"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          District <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.district}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, district: e.target.value })
                          }
                          placeholder="e.g. Nadia"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          State <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.state}
                          onChange={(e) => setWizardForm({ ...wizardForm, state: e.target.value })}
                          placeholder="e.g. West Bengal"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          PIN Code (6-Digit) <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={wizardForm.pinCode}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              pinCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                            })
                          }
                          placeholder="741235"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono tabular-nums"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Country <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wizardForm.country}
                          onChange={(e) =>
                            setWizardForm({ ...wizardForm, country: e.target.value })
                          }
                          placeholder="India"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 — MEMBERSHIP INFORMATION */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Step 3 — Membership Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Member ID (System Generated)
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={wizardForm.memberId}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-700 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Membership Registration Date
                        </label>
                        <input
                          type="date"
                          readOnly
                          value={wizardForm.membershipRegistrationDate}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono text-slate-700 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Member Category <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={wizardForm.memberCategory}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              memberCategory: e.target.value as MemberCategory,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                        >
                          <option value="individual">Individual Supporter</option>
                          <option value="youth_student">Youth / Student Supporter</option>
                          <option value="patron">Foundation Patron</option>
                          <option value="alumni_supporter">Alumni &amp; Former Player</option>
                          <option value="institutional">Institutional / Corporate Partner</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Preferred Communication Method <span className="text-rose-600">*</span>
                        </label>
                        <select
                          value={wizardForm.preferredCommunicationMethod}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              preferredCommunicationMethod: e.target.value as any,
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                        >
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                          <option value="phone">Phone Call</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Areas of Interest in Football Development (Optional)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(portalModuleConfig.interestAreas?.length
                          ? portalModuleConfig.interestAreas
                          : FOOTBALL_INTEREST_AREAS
                        ).map((area: string) => {
                          const checked = (wizardForm.areasOfInterest || []).includes(area);
                          return (
                            <label
                              key={area}
                              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const list = wizardForm.areasOfInterest || [];
                                  setWizardForm({
                                    ...wizardForm,
                                    areasOfInterest: e.target.checked
                                      ? [...list, area]
                                      : list.filter((x) => x !== area),
                                  });
                                }}
                                className="rounded text-slate-900"
                              />
                              <span>{area}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="text-xs font-semibold text-slate-800">
                        Emergency Contact (Optional)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Contact Name"
                          value={wizardForm.emergencyContact?.name || ''}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              emergencyContact: {
                                name: e.target.value,
                                relationship: wizardForm.emergencyContact?.relationship || '',
                                phone: wizardForm.emergencyContact?.phone || '',
                              },
                            })
                          }
                          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Relationship"
                          value={wizardForm.emergencyContact?.relationship || ''}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              emergencyContact: {
                                name: wizardForm.emergencyContact?.name || '',
                                relationship: e.target.value,
                                phone: wizardForm.emergencyContact?.phone || '',
                              },
                            })
                          }
                          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit Mobile"
                          value={wizardForm.emergencyContact?.phone || ''}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              emergencyContact: {
                                name: wizardForm.emergencyContact?.name || '',
                                relationship: wizardForm.emergencyContact?.relationship || '',
                                phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                              },
                            })
                          }
                          className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 — DECLARATION AND CONSENT */}
                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Step 4 — Declaration and Consent
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardForm.accuracyConfirmed}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              accuracyConfirmed: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded text-slate-900"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            Confirmation of Accuracy <span className="text-rose-600">*</span>
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            I confirm that the personal, address, and contact information submitted in this profile is accurate and belongs to me.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardForm.dataProcessingConsent}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              dataProcessingConsent: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded text-slate-900"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            Membership &amp; Donation Administration Consent{' '}
                            <span className="text-rose-600">*</span>
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            I consent to MADEN Football Academy Foundation processing my information for membership registration, payment verification, statutory compliance, and official receipt issuance.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizardForm.promotionalUpdatesConsent}
                          onChange={(e) =>
                            setWizardForm({
                              ...wizardForm,
                              promotionalUpdatesConsent: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded text-slate-900"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">
                            Academy News &amp; Fundraising Updates (Optional — Not Compulsory)
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            I would like to receive periodic grassroots match updates, scholar progress reports, and foundation fundraising newsletters.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Wizard Navigation Footer */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    {wizardStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setWizardStep((wizardStep - 1) as 1 | 2 | 3 | 4)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous Step</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleSaveProfileDraft}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      Save as Draft
                    </button>

                    {wizardStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextWizardStep}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Save &amp; Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Member Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. MAKE A DONATION (SECTION 6)                                 */}
          {/* ============================================================== */}
          {activeSection === 'make_donation' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  Make a Donation &amp; Select Contribution Plan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a preset or custom contribution amount and select your preferred contribution frequency.
                </p>
              </div>

              {donationFormNotice && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                    donationFormNotice.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{donationFormNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateDonationPlanAndProceed} className="space-y-6">
                {/* 1. Preset & Custom Amounts */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    1. Select Contribution Amount (INR)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {settings.presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSelectedPreset(amt)}
                        className={`py-3 px-3 rounded-xl border font-mono text-sm font-bold tabular-nums transition-colors cursor-pointer ${
                          selectedPreset === amt
                            ? 'bg-slate-900 text-amber-400 border-slate-900'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedPreset('custom')}
                      className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        selectedPreset === 'custom'
                          ? 'bg-slate-900 text-amber-400 border-slate-900'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Custom Amount
                    </button>
                  </div>

                  {selectedPreset === 'custom' && (
                    <div className="pt-2 max-w-sm">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Enter Custom Amount (Min ₹{settings.minCustomAmount.toLocaleString('en-IN')} — Max ₹
                        {settings.maxCustomAmount.toLocaleString('en-IN')})
                      </label>
                      <input
                        type="number"
                        min={settings.minCustomAmount}
                        max={settings.maxCustomAmount}
                        required
                        value={customAmountInput}
                        onChange={(e) => setCustomAmountInput(e.target.value)}
                        placeholder={`e.g. 1500`}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold tabular-nums"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Donation Frequency */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    2. Select Contribution Frequency
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        {
                          id: 'monthly',
                          label: 'Monthly',
                          unit: 'per month',
                          desc: 'Monthly contribution commitment & reminder',
                        },
                        {
                          id: 'quarterly',
                          label: 'Quarterly',
                          unit: 'per quarter',
                          desc: 'Every 3 months contribution schedule',
                        },
                        {
                          id: 'yearly',
                          label: 'Yearly',
                          unit: 'per year',
                          desc: 'Annual foundation patron commitment',
                        },
                      ] as const
                    ).map((freq) => {
                      const isSelected = selectedFrequency === freq.id;
                      return (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => setSelectedFrequency(freq.id)}
                          className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="text-xs font-bold">{freq.label}</div>
                          <div
                            className={`text-sm font-mono font-bold tabular-nums mt-1 ${
                              isSelected ? 'text-amber-400' : 'text-slate-900'
                            }`}
                          >
                            ₹{effectiveDonationAmount.toLocaleString('en-IN')} {freq.unit}
                          </div>
                          <div
                            className={`text-[11px] mt-1 ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {freq.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Optional Purpose / Message */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-800">
                    3. Donation Purpose or Message (Optional)
                  </label>
                  {portalModuleConfig.donationPurposes?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {portalModuleConfig.donationPurposes.map((p: string) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setDonationPurpose(p)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                            donationPurpose === p
                              ? 'bg-slate-900 text-amber-400 border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    maxLength={180}
                    value={donationPurpose}
                    onChange={(e) => setDonationPurpose(e.target.value)}
                    placeholder="e.g. Underprivileged Youth Player Scholarship Fund"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                {/* 4. Plan Confirmation Card (Mandatory Section 6) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="text-xs font-bold text-slate-900">
                      4. Contribution Plan Confirmation Summary
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                      ₹{effectiveDonationAmount.toLocaleString('en-IN')}{' '}
                      {selectedFrequency === 'monthly'
                        ? 'per month'
                        : selectedFrequency === 'quarterly'
                        ? 'per quarter'
                        : 'per year'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Donor Name: </span>
                      <span className="font-semibold text-slate-900">
                        {memberRecord.fullName || profile.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Member ID: </span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {memberRecord.memberId}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Selected Frequency: </span>
                      <span className="font-semibold capitalize text-slate-900">
                        {selectedFrequency} (₹{effectiveDonationAmount.toLocaleString('en-IN')}{' '}
                        {selectedFrequency === 'monthly'
                          ? 'per month'
                          : selectedFrequency === 'quarterly'
                          ? 'per quarter'
                          : 'per year'}
                        )
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Total Due for Current Contribution: </span>
                      <span className="font-mono font-bold text-slate-950 tabular-nums">
                        ₹{effectiveDonationAmount.toLocaleString('en-IN')}.00
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Donation Purpose: </span>
                      <span className="text-slate-800">{donationPurpose}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                    <strong>Important Notice on QR Contribution Plans:</strong> QR-based payments are manual UPI transfers and do <strong>not</strong> set up automatic recurring bank debits. Selecting a Monthly, Quarterly, or Yearly plan records your recurring contribution commitment and schedule reminders in your Donators Portal.
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={planConfirmedCheckbox}
                      onChange={(e) => setPlanConfirmedCheckbox(e.target.checked)}
                      className="mt-0.5 rounded text-slate-900"
                    />
                    <span>
                      I confirm the contribution plan details above (
                      <strong>
                        ₹{effectiveDonationAmount.toLocaleString('en-IN')}{' '}
                        {selectedFrequency === 'monthly'
                          ? 'per month'
                          : selectedFrequency === 'quarterly'
                          ? 'per quarter'
                          : 'per year'}
                      </strong>
                      ) and wish to generate my Donation Invoice and proceed to the Official QR Code Payment page.
                    </span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Confirm Plan &amp; Proceed to Official QR Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. MY DONATION PLANS (SECTION 11)                              */}
          {/* ============================================================== */}
          {activeSection === 'my_plans' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    My Recurring Contribution Commitments &amp; Plans
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage your scheduled Monthly, Quarterly, or Yearly contribution commitments. Updating a plan applies only to future scheduled contributions and never alters historical donation records.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('make_donation')}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  + Create New Plan
                </button>
              </div>

              {planFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs ${
                    planFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {planFeedback.text}
                </div>
              )}

              {myPlans.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-sm font-semibold text-slate-800">
                    No Contribution Plans Configured
                  </div>
                  <p className="text-xs text-slate-500">
                    Set up a Monthly, Quarterly, or Yearly contribution schedule from the Make a Donation section.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPlans.map((plan) => (
                    <div
                      key={plan.planId}
                      className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-slate-500 font-mono tabular-nums">
                            {plan.planId} · Started {plan.startDate}
                          </div>
                          <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                            ₹{plan.amount.toLocaleString('en-IN')} / {plan.frequency}
                            <span className="ml-2 text-xs font-sans font-semibold capitalize text-slate-600">
                              (Status: {plan.status})
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            Purpose: {plan.purpose}
                          </div>
                        </div>

                        <div className="text-xs sm:text-right space-y-1">
                          <div className="text-slate-500">Next Suggested Contribution Date:</div>
                          <div className="font-mono font-semibold text-slate-900 tabular-nums">
                            {plan.nextSuggestedPaymentDate}
                          </div>
                        </div>
                      </div>

                      {editingPlanId === plan.planId ? (
                        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                          <div className="text-xs font-semibold text-slate-800">
                            Modify Future Contribution Plan (Does not alter past donations)
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">
                                New Contribution Amount (INR)
                              </label>
                              <input
                                type="number"
                                min={settings.minCustomAmount}
                                max={settings.maxCustomAmount}
                                value={editPlanAmount}
                                onChange={(e) => setEditPlanAmount(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-600 mb-1">
                                New Frequency
                              </label>
                              <select
                                value={editPlanFrequency}
                                onChange={(e) =>
                                  setEditPlanFrequency(e.target.value as DonationFrequency)
                                }
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                              >
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const res = DonatorsPortalService.updateFutureContributionPlan(
                                  profile.id,
                                  plan.planId,
                                  {
                                    amount: Number(editPlanAmount),
                                    frequency: editPlanFrequency,
                                  }
                                );
                                if (res.success) {
                                  setEditingPlanId(null);
                                  setPlanFeedback({
                                    type: 'success',
                                    text: 'Future contribution plan updated.',
                                  });
                                } else {
                                  setPlanFeedback({
                                    type: 'error',
                                    text: res.error || 'Could not update plan.',
                                  });
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                            >
                              Save Plan Changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPlanId(null)}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlanId(plan.planId);
                              setEditPlanAmount(String(plan.amount));
                              setEditPlanFrequency(plan.frequency);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-medium cursor-pointer"
                          >
                            Change Amount / Frequency
                          </button>

                          {plan.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() =>
                                DonatorsPortalService.updateFutureContributionPlan(
                                  profile.id,
                                  plan.planId,
                                  { status: 'paused' }
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-amber-800 text-xs font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>Pause Plan</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                DonatorsPortalService.updateFutureContributionPlan(
                                  profile.id,
                                  plan.planId,
                                  { status: 'active' }
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Resume Plan</span>
                            </button>
                          )}

                          {plan.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() =>
                                DonatorsPortalService.updateFutureContributionPlan(
                                  profile.id,
                                  plan.planId,
                                  { status: 'cancelled' }
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Cancel Commitment</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. DONATION HISTORY                                            */}
          {/* ============================================================== */}
          {activeSection === 'donation_history' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Complete Donation History</h2>
                  <p className="text-xs text-slate-500">
                    All contribution records associated with your Member ID ({memberRecord.memberId}).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search Ref, Invoice, UTR..."
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="verified">Verified / Paid</option>
                    <option value="submitted_for_verification">Submitted for Verification</option>
                    <option value="awaiting_payment">Awaiting Payment</option>
                    <option value="rejected">Rejected</option>
                    <option value="refunded">Refunded / Reversed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {(() => {
                const filtered = myDonations.filter((d) => {
                  const statusMatch =
                    historyStatusFilter === 'all' || d.paymentStatus === historyStatusFilter;
                  const q = historySearch.trim().toLowerCase();
                  const searchMatch =
                    !q ||
                    d.donationId.toLowerCase().includes(q) ||
                    d.invoiceNumber.toLowerCase().includes(q) ||
                    (d.receiptNumber || '').toLowerCase().includes(q) ||
                    (d.transactionReference || '').toLowerCase().includes(q) ||
                    d.purpose.toLowerCase().includes(q);
                  return statusMatch && searchMatch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                      No donation records match the current filter.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2.5 px-3">Donation Ref</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Plan / Purpose</th>
                          <th className="py-2.5 px-3">UTR Reference</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Documents / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((d) => (
                          <tr key={d.donationId} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-semibold tabular-nums text-slate-900">
                              {d.donationId}
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                              {new Date(d.createdAt).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              <div className="capitalize font-medium text-slate-800">
                                {d.frequency}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">
                                {d.purpose}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                              {d.transactionReference || '—'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                              ₹{d.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`font-semibold capitalize ${
                                  d.paymentStatus === 'verified'
                                    ? 'text-emerald-700'
                                    : d.paymentStatus === 'submitted_for_verification'
                                    ? 'text-amber-700'
                                    : d.paymentStatus === 'rejected' ||
                                      d.paymentStatus === 'refunded'
                                    ? 'text-rose-700'
                                    : 'text-slate-600'
                                }`}
                              >
                                {d.paymentStatus.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setDocModalState({ donation: d, mode: 'invoice' })}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] cursor-pointer"
                              >
                                Preview Invoice
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDonationPdf(d, settings, 'invoice')}
                                className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-[11px] cursor-pointer"
                                title="Download Invoice PDF"
                              >
                                Invoice PDF
                              </button>
                              {d.paymentStatus === 'verified' && d.receiptNumber && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDocModalState({ donation: d, mode: 'receipt' })
                                    }
                                    className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] cursor-pointer"
                                  >
                                    View Receipt
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadDonationPdf(d, settings, 'receipt')}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] cursor-pointer"
                                    title="Download Verified Official Receipt PDF"
                                  >
                                    Receipt PDF
                                  </button>
                                </>
                              )}
                              {d.paymentStatus === 'refunded' && d.reversalDocumentNumber && (
                                <button
                                  type="button"
                                  onClick={() => downloadDonationPdf(d, settings, 'reversal')}
                                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] cursor-pointer"
                                >
                                  Reversal PDF
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ============================================================== */}
          {/* 7. PENDING PAYMENTS & OFFICIAL QR CODE PAYMENT PAGE (SEC. 7)   */}
          {/* ============================================================== */}
          {activeSection === 'pending_payments' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Official MADEN FAF QR Code Payment &amp; Confirmation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Scan the official Foundation QR code, complete your UPI transfer, and submit your 12-digit UTR below for administrative verification.
                    </p>
                  </div>

                  {myDonations.length > 0 && (
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Select Contribution Reference:
                      </label>
                      <select
                        value={selectedPaymentDonation?.donationId || ''}
                        onChange={(e) => setActivePaymentDonationId(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50"
                      >
                        {myDonations.map((d) => (
                          <option key={d.donationId} value={d.donationId}>
                            {d.donationId} — ₹{d.amount.toLocaleString('en-IN')} ({d.paymentStatus})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {!selectedPaymentDonation ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="text-sm font-semibold text-slate-800">
                      No Pending Contribution Selected
                    </div>
                    <p className="text-xs text-slate-500">
                      First choose a contribution amount and frequency in &ldquo;Make a Donation&rdquo; to generate a Donation Reference.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveSection('make_donation')}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs cursor-pointer"
                    >
                      Go to Make a Donation
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Official QR Code & Payment Instructions */}
                    <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="text-center space-y-1">
                          <div className="text-xs font-bold text-slate-900">
                            {settings.organizationDisplayDetails.legalName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Official Verified Foundation QR Code
                          </div>
                        </div>

                        {/* Official QR Code Container — NEVER fabricate a fake QR code */}
                        <div className="w-56 h-56 mx-auto rounded-2xl bg-white border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
                          {settings.activeStatus && settings.officialQrCodeUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={settings.officialQrCodeUrl}
                              alt="Official MADEN FAF Donation QR Code"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="space-y-2 p-2">
                              <QrCode className="w-10 h-10 text-slate-400 mx-auto" />
                              <div className="text-xs font-semibold text-slate-800">
                                Official QR Code Pending Administrator Upload
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                For your security, this portal never generates synthetic QR codes. An authorized MADEN FAF Administrator must upload and activate the official merchant QR image in the Admin Portal.
                              </p>
                            </div>
                          )}
                        </div>

                        {settings.activeStatus && settings.officialQrCodeUrl && (
                          <div className="text-center">
                            <button
                              type="button"
                              onClick={handleDownloadQrImage}
                              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Official QR Code</span>
                            </button>
                          </div>
                        )}

                        {/* Selected Contribution Reference Summary */}
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Donation Reference:</span>
                            <span className="font-mono font-bold tabular-nums text-slate-900">
                              {selectedPaymentDonation.donationId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Invoice Number:</span>
                            <span className="font-mono tabular-nums text-slate-800">
                              {selectedPaymentDonation.invoiceNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Member ID:</span>
                            <span className="font-mono tabular-nums text-slate-800">
                              {selectedPaymentDonation.memberId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Amount Due:</span>
                            <span className="font-mono font-bold text-sm tabular-nums text-slate-950">
                              ₹{selectedPaymentDonation.amount.toLocaleString('en-IN')}.00
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Frequency:</span>
                            <span className="capitalize font-medium text-slate-800">
                              {selectedPaymentDonation.frequency}
                            </span>
                          </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="space-y-1.5 text-[11px] text-slate-600">
                          <div className="font-semibold text-slate-800">Payment Instructions:</div>
                          <ol className="list-decimal pl-4 space-y-1">
                            {settings.paymentInstructions.map((inst, i) => (
                              <li key={i}>{inst}</li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      {selectedPaymentDonation.paymentStatus === 'awaiting_payment' && (
                        <button
                          type="button"
                          onClick={() => {
                            DonatorsPortalService.cancelPendingDonation(
                              profile.id,
                              selectedPaymentDonation.donationId
                            );
                          }}
                          className="w-full py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium cursor-pointer"
                        >
                          Cancel Unpaid Contribution Request
                        </button>
                      )}
                    </div>

                    {/* Right Column: Payment Confirmation Form */}
                    <div className="lg:col-span-7 space-y-4">
                      {selectedPaymentDonation.paymentStatus === 'rejected' &&
                        selectedPaymentDonation.rejectionReason && (
                          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                            <div className="font-semibold">
                              Previous Payment Submission Rejected — You May Resubmit Valid Details
                            </div>
                            <p className="text-rose-800">
                              Administrator Reason: &ldquo;{selectedPaymentDonation.rejectionReason}&rdquo;
                            </p>
                          </div>
                        )}

                      {paymentFeedback && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                            paymentFeedback.type === 'success'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          {paymentFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <span>{paymentFeedback.text}</span>
                        </div>
                      )}

                      <form onSubmit={handleSubmitPaymentConfirmation} className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900">
                          Submit UPI Payment Confirmation for Verification
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Donor Name
                            </label>
                            <input
                              type="text"
                              required
                              value={effectivePaymentDonorNameValue}
                              onChange={(e) => setPaymentDonorNameInput(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Registered Mobile Number <span className="text-rose-600">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={effectivePaymentMobileValue}
                              onChange={(e) =>
                                setPaymentMobileInput(
                                  e.target.value.replace(/\D/g, '').slice(0, 10)
                                )
                              }
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Donation Reference Number
                            </label>
                            <input
                              type="text"
                              readOnly
                              value={selectedPaymentDonation.donationId}
                              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-700"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Payment Date <span className="text-rose-600">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={paymentDateInput}
                              onChange={(e) => setPaymentDateInput(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Amount Paid (INR) <span className="text-rose-600">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              value={effectivePaidAmountValue}
                              onChange={(e) => setPaidAmountInput(e.target.value)}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold tabular-nums"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              UPI Transaction ID / 12-Digit UTR <span className="text-rose-600">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={utrInput}
                              onChange={(e) => setUtrInput(e.target.value)}
                              placeholder="e.g. 412389012345"
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase tabular-nums"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Optional Payment Screenshot (PNG/JPG/WEBP, max 2 MB)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Attach Screenshot</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleScreenshotUpload}
                                className="hidden"
                              />
                            </label>
                            {paymentScreenshotName && (
                              <span className="text-xs text-emerald-700 font-medium truncate">
                                Attached: {paymentScreenshotName}
                              </span>
                            )}
                          </div>
                        </div>

                        <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentDeclarationChecked}
                            onChange={(e) => setPaymentDeclarationChecked(e.target.checked)}
                            className="mt-0.5 rounded text-slate-900"
                          />
                          <span>
                            I declare that I have genuinely initiated the UPI payment of{' '}
                            <strong>₹{selectedPaymentDonation.amount.toLocaleString('en-IN')}</strong>{' '}
                            to {settings.organizationDisplayDetails.legalName}. I understand that submitting a UTR or screenshot places this record in <strong>Submitted for Verification</strong> status and an official receipt is issued only after administrative verification.
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={
                            selectedPaymentDonation.paymentStatus === 'verified' ||
                            selectedPaymentDonation.paymentStatus === 'cancelled'
                          }
                          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer transition-colors"
                        >
                          Submit Payment Details for Administrative Verification
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 8. PAYMENT VERIFICATION STATUS & MOBILE CONFIRMATION (SEC 7,8) */}
          {/* ============================================================== */}
          {activeSection === 'verification_status' && (
            <div className="space-y-6">
              {/* Mobile Number Confirmation Box (Section 8) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Registered Mobile Number Confirmation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Confirm the mobile number associated with your Member profile and UPI donations.
                    </p>
                  </div>
                  <div className="text-xs font-mono tabular-nums">
                    Masked Mobile:{' '}
                    <strong className="text-slate-900">
                      {maskIndianMobile(memberRecord.primaryMobile)}
                    </strong>{' '}
                    · Status:{' '}
                    <strong className="capitalize text-slate-900">
                      {memberRecord.verifiedContactMetadata?.verificationStatus?.replace(
                        /_/g,
                        ' '
                      ) || 'unverified'}
                    </strong>
                  </div>
                </div>

                {!settings.smsOtpProviderConfigured && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <strong>SMS OTP Gateway Notice:</strong> Live third-party SMS OTP dispatch is not currently configured in this environment ({settings.smsOtpProviderName}). This portal never simulates fake OTP codes. Submitting your mobile number below registers it under the <strong>Authorized Administrative Verification Workflow</strong> so MADEN FAF Administration can verify your phone alongside your UPI transfer.
                  </div>
                )}

                {mobileFeedback && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs ${
                      mobileFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {mobileFeedback.text}
                  </div>
                )}

                <form
                  onSubmit={handleRequestMobileConfirmation}
                  className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
                >
                  <div className="flex-1 max-w-sm">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      10-Digit Indian Mobile Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={effectiveMobileToConfirmValue}
                      onChange={(e) =>
                        setMobileToConfirm(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono tabular-nums"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer whitespace-nowrap"
                  >
                    Confirm Mobile Number for Verification
                  </button>
                </form>
              </div>

              {/* Payment Submissions Verification Queue */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">
                  Submitted Payment Confirmations &amp; Verification Status
                </h2>

                {mySubmissions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                    You have not submitted any UPI transaction references for verification yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2.5 px-3">Submission ID</th>
                          <th className="py-2.5 px-3">Donation Ref</th>
                          <th className="py-2.5 px-3">UTR / Reference</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3">Verification Status</th>
                          <th className="py-2.5 px-3">Reviewed By / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mySubmissions.map((sub) => (
                          <tr key={sub.submissionId}>
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-800">
                              {sub.submissionId}
                            </td>
                            <td className="py-3 px-3 font-mono font-semibold tabular-nums text-slate-900">
                              {sub.donationId}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold tabular-nums text-slate-900">
                              {sub.transactionReference}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                              ₹{sub.submittedAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`font-semibold capitalize ${
                                  sub.verificationStatus === 'verified'
                                    ? 'text-emerald-700'
                                    : sub.verificationStatus === 'rejected'
                                    ? 'text-rose-700'
                                    : 'text-amber-700'
                                }`}
                              >
                                {sub.verificationStatus.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {sub.rejectionReason
                                ? `Rejected: ${sub.rejectionReason}`
                                : sub.reviewedBy
                                ? `Verified by ${sub.reviewedBy}`
                                : 'In Admin Verification Queue'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ============================================================== */}
          {/* 9. INVOICES AND RECEIPTS & 10. DOWNLOAD DOCUMENTS              */}
          {/* ============================================================== */}
          {(activeSection === 'invoices_receipts' ||
            activeSection === 'download_documents') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {activeSection === 'invoices_receipts'
                      ? 'PDF Donation Invoices & Official Verified Receipts'
                      : 'Print-Ready PDF Document Download Center'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Download A4 print-ready PDF invoices (payment instructions) or official verified donation receipts issued after administrative verification.
                  </p>
                </div>

                {verifiedDonations.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadAnnualVerifiedStatementPdf(memberRecord, myDonations, settings)
                    }
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Verified Statement (.pdf)</span>
                  </button>
                )}
              </div>

              {/* Document Integrity & Verification Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium">
                    Donation Invoices (Payment Instructions)
                  </div>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {myDonations.length} Available
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Marked &ldquo;Not a Payment Receipt&rdquo;
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="text-[11px] text-emerald-800 font-medium">
                    Verified Official Receipts (PDF Ready)
                  </div>
                  <div className="text-base font-bold font-mono tabular-nums text-emerald-900 mt-0.5">
                    {verifiedDonations.length} Unlocked
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    Total Verified: ₹{totalVerifiedAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className="text-[11px] text-amber-800 font-medium">
                    Awaiting Payment / Verification
                  </div>
                  <div className="text-base font-bold font-mono tabular-nums text-amber-900 mt-0.5">
                    {pendingVerificationCount + awaitingPaymentCount} Pending
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Official receipt unlocks upon admin verification
                  </div>
                </div>
              </div>

              {myDonations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  No invoices or receipts have been generated for your account yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myDonations.map((d) => {
                    const hasReceipt =
                      (d.paymentStatus === 'verified' || d.paymentStatus === 'refunded') &&
                      Boolean(d.receiptNumber);
                    const hasReversal =
                      d.paymentStatus === 'refunded' && Boolean(d.reversalDocumentNumber);

                    return (
                      <div
                        key={d.donationId}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              {d.donationId}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono font-bold text-slate-900 tabular-nums">
                              ₹{d.amount.toLocaleString('en-IN')} ({d.frequency})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`capitalize font-semibold ${
                                d.paymentStatus === 'verified'
                                  ? 'text-emerald-700'
                                  : d.paymentStatus === 'submitted_for_verification'
                                  ? 'text-amber-700'
                                  : d.paymentStatus === 'rejected' || d.paymentStatus === 'refunded'
                                  ? 'text-rose-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              Status: {d.paymentStatus.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="text-slate-500 font-mono tabular-nums">
                            Invoice: {d.invoiceNumber}
                            {d.receiptNumber ? ` · Official Receipt: ${d.receiptNumber}` : ''}
                            {d.reversalDocumentNumber
                              ? ` · Reversal Note: ${d.reversalDocumentNumber}`
                              : ''}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Purpose: {d.purpose || 'General Foundation Support'} · Created:{' '}
                            {new Date(d.createdAt).toLocaleDateString('en-IN')}
                            {d.verifiedAt
                              ? ` · Verified: ${new Date(d.verifiedAt).toLocaleDateString('en-IN')}`
                              : ''}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Invoice Preview + Direct PDF Download */}
                          <button
                            type="button"
                            onClick={() => setDocModalState({ donation: d, mode: 'invoice' })}
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>Preview Invoice</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => downloadDonationPdf(d, settings, 'invoice')}
                            className="px-3 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-600" />
                            <span>Invoice PDF</span>
                          </button>

                          {/* Official Verified Receipt Preview + Direct PDF Download */}
                          {hasReceipt ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setDocModalState({ donation: d, mode: 'receipt' })}
                                className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-semibold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Preview / Print Receipt</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDonationPdf(d, settings, 'receipt')}
                                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Receipt PDF ({d.receiptNumber})</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic px-2">
                              Official Receipt PDF locked until payment verified
                            </span>
                          )}

                          {hasReversal && (
                            <button
                              type="button"
                              onClick={() => downloadDonationPdf(d, settings, 'reversal')}
                              className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Reversal PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 11. NOTIFICATIONS                                              */}
          {/* ============================================================== */}
          {activeSection === 'notifications' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Member Notifications</h2>
                  <p className="text-xs text-slate-500">
                    Alerts for payment verifications, official receipts, and plan reminders.
                  </p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => DonatorsPortalService.markAllNotificationsRead(profile.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {myNotifications.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => DonatorsPortalService.markNotificationRead(profile.id, n.id)}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.isRead
                          ? 'bg-white border-slate-200 text-slate-600'
                          : 'bg-amber-50/50 border-amber-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{n.title}</span>
                        <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                          {new Date(n.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 12. ACCOUNT SETTINGS                                           */}
          {/* ============================================================== */}
          {activeSection === 'account_settings' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  Account &amp; Security Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Review your authenticated identity, assigned roles, and session security.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900">Authenticated Identity</div>
                  <div>
                    <span className="text-slate-500">Account UID: </span>
                    <span className="font-mono text-slate-800">{profile.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Verified Login Email: </span>
                    <span className="font-mono text-slate-800">{profile.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Primary Assigned Role: </span>
                    <span className="font-semibold uppercase text-slate-900">{profile.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Authorized Roles: </span>
                    <span className="font-mono text-slate-800">
                      {(profile.roles || [profile.role]).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900">Data Isolation &amp; Privacy</div>
                  <p className="text-slate-600 leading-relaxed">
                    Your Member Profile ({memberRecord.memberId}), mobile number, contribution plans, and tax/donation receipts are isolated to your authenticated UID and are never exposed to other members.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out of Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Printable Invoice / Official Receipt / Reversal Modal */}
      {docModalState && (
        <DonationDocumentViewer
          donation={docModalState.donation}
          settings={settings}
          mode={docModalState.mode}
          onClose={() => setDocModalState(null)}
        />
      )}
    </div>
  );
};
