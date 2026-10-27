'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  DonatorsPortalService,
  subscribeDonatorsPortal,
  DonationRecordItem,
  MemberProfileRecord,
  MemberCategory,
  DonationFrequency,
  DonationPlanRecord,
  DEFAULT_ORG_PAYMENT_SETTINGS,
} from '@/lib/donatorsPortalService';
import {
  DonationDocumentViewer,
  DocumentViewMode,
} from '@/components/membership/DonationDocumentViewer';
import { MemberProfileDetailModal } from './MemberProfileDetailModal';
import { downloadDonationPdf } from '@/lib/pdfDocumentGenerator';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  ShieldCheck,
  Users,
  Settings,
  History,
  Save,
  Plus,
  Edit3,
  Trash2,
  Download,
  RefreshCw,
  Bell,
  Sliders,
  CalendarClock,
  Search,
  Send,
  X,
  Check,
  HeartHandshake,
  CreditCard,
  Eye,
} from 'lucide-react';

interface AdminDonationsManagerProps {
  profile?: UserProfile | null;
  onNotify?: (msg: { type: 'success' | 'error'; text: string }) => void;
}

export const AdminDonationsManager: React.FC<AdminDonationsManagerProps> = ({
  profile,
  onNotify,
}) => {
  useEffect(() => {
    DonatorsPortalService.hydrateFromCloud();
  }, []);

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
        (localStorage.getItem('maden_faf_donor_admin_audit_logs_v1') || '')
      );
    },
    () => 'server'
  );

  const effectiveRole = profile?.role || 'admin';
  const adminActor = {
    uid: profile?.id || 'usr-admin-01',
    email: profile?.email || 'pravakarghosh.2025@gmail.com',
    role: effectiveRole,
  };

  const settings = React.useMemo(
    () => DonatorsPortalService.getPaymentSettings() || DEFAULT_ORG_PAYMENT_SETTINGS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick]
  );

  const allSubmissions = React.useMemo(
    () => DonatorsPortalService.getAllPaymentSubmissions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick]
  );

  const allDonations = React.useMemo(
    () => DonatorsPortalService.getAllDonations(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick]
  );

  const allMembers = React.useMemo(
    () => DonatorsPortalService.getAllMemberProfiles(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick]
  );

  const allPlans = React.useMemo(
    () => DonatorsPortalService.getAllDonationPlans(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick]
  );

  const auditLogs = React.useMemo(
    () => DonatorsPortalService.getAdminAuditLogs(effectiveRole),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick, effectiveRole]
  );

  const [activeTab, setActiveTab] = useState<
    | 'submissions'
    | 'ledger'
    | 'members'
    | 'plans'
    | 'qr_settings'
    | 'module_config'
    | 'audit'
  >('submissions');

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const notifyBoth = (msg: { type: 'success' | 'error'; text: string }) => {
    setFeedback(msg);
    if (onNotify) onNotify(msg);
  };

  // Search & Filter states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('all');
  const [memberSearch, setMemberSearch] = useState('');

  // Reject modal / inline state
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Reversal / Refund state
  const [reversingDonationId, setReversingDonationId] = useState<string | null>(null);
  const [reversalReasonInput, setReversalReasonInput] = useState<string>('');

  // Screenshot preview modal
  const [previewEvidenceUrl, setPreviewEvidenceUrl] = useState<string | null>(null);

  // Document viewer modal
  const [docModalState, setDocModalState] = useState<{
    donation: DonationRecordItem;
    mode: DocumentViewMode;
  } | null>(null);

  // Member Complete Profile & ID Card Viewer Modal State
  const [selectedMemberForModal, setSelectedMemberForModal] =
    useState<MemberProfileRecord | null>(null);

  // Member Profile Add/Edit Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberForm, setEditingMemberForm] = useState<{
    uid?: string;
    memberId?: string;
    fullName: string;
    email: string;
    primaryMobile: string;
    dob: string;
    occupation: string;
    memberCategory: MemberCategory;
    houseAndStreet: string;
    villageTownCity: string;
    postOffice: string;
    district: string;
    state: string;
    pinCode: string;
    profileCompletionStatus: 'incomplete' | 'draft' | 'complete';
    isMobileVerified: boolean;
  }>({
    fullName: '',
    email: '',
    primaryMobile: '',
    dob: '1992-01-01',
    occupation: 'Foundation Supporter',
    memberCategory: 'individual',
    houseAndStreet: '',
    villageTownCity: 'Kalyani',
    postOffice: 'Kalyani HPO',
    district: 'Nadia',
    state: 'West Bengal',
    pinCode: '741235',
    profileCompletionStatus: 'complete',
    isMobileVerified: true,
  });

  // Manual Donation Creation Modal State
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);
  const [newDonationForm, setNewDonationForm] = useState<{
    uid: string;
    amount: string;
    frequency: DonationFrequency;
    purpose: string;
    paymentStatus: 'awaiting_payment' | 'submitted_for_verification' | 'verified';
    transactionReference: string;
    paymentDate: string;
  }>({
    uid: allMembers[0]?.uid || '',
    amount: '1000',
    frequency: 'monthly',
    purpose:
      settings.portalModuleConfig?.donationPurposes?.[0] ||
      'Grassroots Youth Training & Player Scholarships',
    paymentStatus: 'verified',
    transactionReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  // Plan Edit State
  const [editingPlan, setEditingPlan] = useState<DonationPlanRecord | null>(null);

  // Editable Payment & Statutory Settings State
  const [qrUrlInput, setQrUrlInput] = useState<string>(settings.officialQrCodeUrl);
  const [qrActiveInput, setQrActiveInput] = useState<boolean>(settings.activeStatus);
  const [presetsCsvInput, setPresetsCsvInput] = useState<string>(
    settings.presetAmounts.join(', ')
  );
  const [minCustomInput, setMinCustomInput] = useState<string>(
    String(settings.minCustomAmount)
  );
  const [maxCustomInput, setMaxCustomInput] = useState<string>(
    String(settings.maxCustomAmount)
  );
  const [allowedFreqs, setAllowedFreqs] = useState<DonationFrequency[]>(
    settings.allowedFrequencies || ['monthly', 'quarterly', 'yearly']
  );
  const [invoicePrefixInput, setInvoicePrefixInput] = useState<string>(
    settings.invoicePrefix || 'MADEN-INV'
  );
  const [receiptPrefixInput, setReceiptPrefixInput] = useState<string>(
    settings.receiptPrefix || 'MADEN-RCP'
  );
  const [reversalPrefixInput, setReversalPrefixInput] = useState<string>(
    settings.reversalPrefix || 'MADEN-REV'
  );
  const [instructionsText, setInstructionsText] = useState<string>(
    (settings.paymentInstructions || []).join('\n')
  );

  // Organization Legal & Statutory Details
  const [legalNameInput, setLegalNameInput] = useState<string>(
    settings.organizationDisplayDetails.legalName
  );
  const [brandNameInput, setBrandNameInput] = useState<string>(
    settings.organizationDisplayDetails.brandName
  );
  const [regAddressInput, setRegAddressInput] = useState<string>(
    settings.organizationDisplayDetails.registeredAddress
  );
  const [officialEmailInput, setOfficialEmailInput] = useState<string>(
    settings.organizationDisplayDetails.officialEmail
  );
  const [officialPhoneInput, setOfficialPhoneInput] = useState<string>(
    settings.organizationDisplayDetails.officialPhone
  );
  const [regNumberInput, setRegNumberInput] = useState<string>(
    settings.organizationDisplayDetails.registrationNumber
  );
  const [signatoryNameInput, setSignatoryNameInput] = useState<string>(
    settings.organizationDisplayDetails.authorizedSignatoryName
  );
  const [signatoryTitleInput, setSignatoryTitleInput] = useState<string>(
    settings.organizationDisplayDetails.authorizedSignatoryTitle
  );
  const [tax80gVerifiedInput, setTax80gVerifiedInput] = useState<boolean>(
    settings.organizationDisplayDetails.tax80gVerified
  );
  const [tax80gRegInput, setTax80gRegInput] = useState<string>(
    settings.organizationDisplayDetails.tax80gRegistrationNumber
  );
  const [panInput, setPanInput] = useState<string>(
    settings.organizationDisplayDetails.panNumber
  );

  // Editable Portal Module Config State (Tab 6)
  const modCfg =
    settings.portalModuleConfig || DEFAULT_ORG_PAYMENT_SETTINGS.portalModuleConfig!;
  const [moduleEnabledInput, setModuleEnabledInput] = useState<boolean>(
    modCfg.moduleEnabled !== false
  );
  const [portalHeadlineInput, setPortalHeadlineInput] = useState<string>(
    modCfg.portalHeadline
  );
  const [portalSubheadlineInput, setPortalSubheadlineInput] = useState<string>(
    modCfg.portalSubheadline
  );
  const [portalBannerInput, setPortalBannerInput] = useState<string>(
    modCfg.portalAnnouncementBanner
  );
  const [primaryCtaInput, setPrimaryCtaInput] = useState<string>(modCfg.primaryCtaLabel);
  const [secondaryCtaInput, setSecondaryCtaInput] = useState<string>(
    modCfg.secondaryCtaLabel
  );
  const [purposesList, setPurposesList] = useState<string[]>(modCfg.donationPurposes || []);
  const [newPurposeInput, setNewPurposeInput] = useState<string>('');
  const [interestsList, setInterestsList] = useState<string[]>(modCfg.interestAreas || []);
  const [newInterestInput, setNewInterestInput] = useState<string>('');

  // Notification Broadcast State
  const [notifTargetUid, setNotifTargetUid] = useState<string>('ALL_MEMBERS');
  const [notifTitle, setNotifTitle] = useState<string>('');
  const [notifMessage, setNotifMessage] = useState<string>('');
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      notifyBoth({
        type: 'error',
        text: 'Official QR code image must be a PNG, JPG, or WEBP file.',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notifyBoth({
        type: 'error',
        text: 'QR code image file must be under 2 MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQrUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const parsedPresets = presetsCsvInput
      .split(',')
      .map((s) => Math.round(Number(s.trim())))
      .filter((n) => !isNaN(n) && n > 0);

    if (parsedPresets.length === 0) {
      notifyBoth({
        type: 'error',
        text: 'Please provide at least one valid preset donation amount.',
      });
      return;
    }

    const parsedInstructions = instructionsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const res = DonatorsPortalService.updatePaymentSettings(adminActor, {
      officialQrCodeUrl: qrUrlInput,
      activeStatus: qrActiveInput,
      presetAmounts: parsedPresets,
      minCustomAmount: Math.max(1, Math.round(Number(minCustomInput) || 100)),
      maxCustomAmount: Math.max(100, Math.round(Number(maxCustomInput) || 500000)),
      allowedFrequencies:
        allowedFreqs.length > 0 ? allowedFreqs : ['monthly', 'quarterly', 'yearly'],
      invoicePrefix: invoicePrefixInput.trim() || 'MADEN-INV',
      receiptPrefix: receiptPrefixInput.trim() || 'MADEN-RCP',
      reversalPrefix: reversalPrefixInput.trim() || 'MADEN-REV',
      paymentInstructions:
        parsedInstructions.length > 0
          ? parsedInstructions
          : DEFAULT_ORG_PAYMENT_SETTINGS.paymentInstructions,
      organizationDisplayDetails: {
        ...settings.organizationDisplayDetails,
        legalName: legalNameInput.trim() || 'MADEN Football Academy Foundation',
        brandName: brandNameInput.trim() || 'MADEN FAF',
        registeredAddress: regAddressInput.trim(),
        officialEmail: officialEmailInput.trim(),
        officialPhone: officialPhoneInput.trim(),
        registrationNumber: regNumberInput.trim(),
        authorizedSignatoryName: signatoryNameInput.trim(),
        authorizedSignatoryTitle: signatoryTitleInput.trim(),
        panNumber: panInput.trim(),
        tax80gVerified: tax80gVerifiedInput,
        tax80gRegistrationNumber: tax80gRegInput.trim(),
      },
    });

    if (res.success) {
      notifyBoth({
        type: 'success',
        text: 'Official QR code, statutory receipt details, and payment configuration saved to Backend & Cloud.',
      });
    } else {
      notifyBoth({ type: 'error', text: res.error || 'Failed to update settings.' });
    }
  };

  const handleSaveModuleConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const res = DonatorsPortalService.updatePaymentSettings(adminActor, {
      portalModuleConfig: {
        moduleEnabled: moduleEnabledInput,
        portalHeadline:
          portalHeadlineInput.trim() || 'Foundation Supporter & Donators Portal',
        portalSubheadline: portalSubheadlineInput.trim(),
        portalAnnouncementBanner: portalBannerInput.trim(),
        primaryCtaLabel: primaryCtaInput.trim() || 'Visit Our Academy',
        secondaryCtaLabel: secondaryCtaInput.trim() || 'See Your Digital Profile',
        donationPurposes:
          purposesList.length > 0
            ? purposesList
            : DEFAULT_ORG_PAYMENT_SETTINGS.portalModuleConfig!.donationPurposes,
        interestAreas:
          interestsList.length > 0
            ? interestsList
            : DEFAULT_ORG_PAYMENT_SETTINGS.portalModuleConfig!.interestAreas,
      },
    });

    if (res.success) {
      notifyBoth({
        type: 'success',
        text: 'Member (Foundation Supporter & Donators Portal) Module configuration saved and live!',
      });
    } else {
      notifyBoth({
        type: 'error',
        text: res.error || 'Failed to save module configuration.',
      });
    }
  };

  const handleOpenAddMember = () => {
    setEditingMemberForm({
      fullName: '',
      email: '',
      primaryMobile: '',
      dob: '1992-01-01',
      occupation: 'Foundation Supporter',
      memberCategory: 'individual',
      houseAndStreet: '',
      villageTownCity: 'Kalyani',
      postOffice: 'Kalyani HPO',
      district: 'Nadia',
      state: 'West Bengal',
      pinCode: '741235',
      profileCompletionStatus: 'complete',
      isMobileVerified: true,
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (m: MemberProfileRecord) => {
    setEditingMemberForm({
      uid: m.uid,
      memberId: m.memberId,
      fullName: m.fullName,
      email: m.email,
      primaryMobile: m.primaryMobile || '',
      dob: m.dob || '1990-01-01',
      occupation: m.occupation || 'Foundation Supporter',
      memberCategory: m.memberCategory || 'individual',
      houseAndStreet: m.houseAndStreet || '',
      villageTownCity: m.villageTownCity || '',
      postOffice: m.postOffice || '',
      district: m.district || '',
      state: m.state || 'West Bengal',
      pinCode: m.pinCode || '',
      profileCompletionStatus: m.profileCompletionStatus || 'complete',
      isMobileVerified: Boolean(m.verifiedContactMetadata?.isVerified),
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMemberModal = (e: React.FormEvent) => {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    const res = DonatorsPortalService.adminUpsertMemberProfile(adminActor, {
      uid: editingMemberForm.uid,
      memberId: editingMemberForm.memberId,
      fullName: editingMemberForm.fullName,
      email: editingMemberForm.email,
      primaryMobile: editingMemberForm.primaryMobile,
      dob: editingMemberForm.dob,
      occupation: editingMemberForm.occupation,
      memberCategory: editingMemberForm.memberCategory,
      houseAndStreet: editingMemberForm.houseAndStreet,
      villageTownCity: editingMemberForm.villageTownCity,
      postOffice: editingMemberForm.postOffice,
      district: editingMemberForm.district,
      state: editingMemberForm.state,
      pinCode: editingMemberForm.pinCode,
      profileCompletionStatus: editingMemberForm.profileCompletionStatus,
      verifiedContactMetadata: {
        mobileNumber: editingMemberForm.primaryMobile,
        isVerified: editingMemberForm.isMobileVerified,
        verificationStatus: editingMemberForm.isMobileVerified ? 'verified' : 'unverified',
        verifiedAt: editingMemberForm.isMobileVerified ? nowIso : undefined,
        verifiedBy: editingMemberForm.isMobileVerified ? adminActor.email : undefined,
        verificationMethod: 'admin_verified',
      },
    });

    if (res.success) {
      setIsMemberModalOpen(false);
      notifyBoth({
        type: 'success',
        text: `Member Profile for ${res.profile?.fullName} (${res.profile?.memberId}) saved!`,
      });
    } else {
      notifyBoth({ type: 'error', text: res.error || 'Could not save Member profile.' });
    }
  };

  const handleCreateManualDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const res = DonatorsPortalService.adminCreateManualDonationRecord(adminActor, {
      uid: newDonationForm.uid,
      amount: Number(newDonationForm.amount),
      frequency: newDonationForm.frequency,
      purpose: newDonationForm.purpose,
      paymentStatus: newDonationForm.paymentStatus,
      transactionReference: newDonationForm.transactionReference,
      paymentDate: newDonationForm.paymentDate,
    });

    if (res.success && res.donation) {
      setIsAddDonationOpen(false);
      notifyBoth({
        type: 'success',
        text: `Created Donation ${res.donation.donationId} (${res.donation.invoiceNumber}${
          res.donation.receiptNumber ? ` · Receipt ${res.donation.receiptNumber}` : ''
        }) for ${res.donation.donorName}.`,
      });
    } else {
      notifyBoth({ type: 'error', text: res.error || 'Failed to create donation record.' });
    }
  };

  const handleSavePlanEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const res = DonatorsPortalService.adminUpdateDonationPlan(
      adminActor,
      editingPlan.planId,
      {
        amount: editingPlan.amount,
        frequency: editingPlan.frequency,
        status: editingPlan.status,
        nextSuggestedPaymentDate: editingPlan.nextSuggestedPaymentDate,
        purpose: editingPlan.purpose,
        reminderEnabled: editingPlan.reminderEnabled,
      }
    );
    if (res.success) {
      setEditingPlan(null);
      notifyBoth({
        type: 'success',
        text: `Updated commitment plan ${editingPlan.planId} for ${editingPlan.donorName}.`,
      });
    } else {
      notifyBoth({ type: 'error', text: res.error || 'Failed to update plan.' });
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const res = DonatorsPortalService.adminSendMemberNotification(adminActor, {
      targetUid: notifTargetUid,
      title: notifTitle,
      message: notifMessage,
      category: 'profile',
    });
    if (res.success) {
      setNotifTitle('');
      setNotifMessage('');
      notifyBoth({
        type: 'success',
        text: `Dispatched notification to ${res.count} Member account(s).`,
      });
    } else {
      notifyBoth({ type: 'error', text: res.error || 'Failed to send notification.' });
    }
  };

  const exportDonationsCsv = () => {
    if (!allDonations.length) return;
    const headers = [
      'Donation Ref',
      'Invoice Number',
      'Receipt Number',
      'Member ID',
      'Donor Name',
      'Email',
      'Mobile',
      'Amount INR',
      'Frequency',
      'Status',
      'UTR Reference',
      'Date',
    ];
    const rows = allDonations.map((d) => [
      d.donationId,
      d.invoiceNumber,
      d.receiptNumber || '',
      d.memberId,
      `"${(d.donorName || '').replace(/"/g, '""')}"`,
      d.donorEmail,
      d.donorMobile,
      d.amount,
      d.frequency,
      d.paymentStatus,
      d.transactionReference || '',
      d.paymentDate || d.createdAt.slice(0, 10),
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `maden_faf_donations_ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMembersCsv = () => {
    if (!allMembers.length) return;
    const headers = [
      'Member ID',
      'Full Name',
      'Email',
      'Mobile',
      'Category',
      'City/Town',
      'District',
      'State',
      'PIN',
      'Profile Status',
      'Mobile Verified',
    ];
    const rows = allMembers.map((m) => [
      m.memberId,
      `"${(m.fullName || '').replace(/"/g, '""')}"`,
      m.email,
      m.primaryMobile,
      m.memberCategory,
      `"${(m.villageTownCity || '').replace(/"/g, '""')}"`,
      m.district,
      m.state,
      m.pinCode,
      m.profileCompletionStatus,
      m.verifiedContactMetadata?.isVerified ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `maden_faf_foundation_members_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingSubmissionsCount = allSubmissions.filter(
    (s) => s.verificationStatus === 'submitted_for_verification'
  ).length;

  const verifiedTotalInr = allDonations
    .filter((d) => d.paymentStatus === 'verified')
    .reduce((acc, d) => acc + d.amount, 0);

  const filteredDonations = allDonations.filter((d) => {
    const q = ledgerSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.donationId.toLowerCase().includes(q) ||
      d.invoiceNumber.toLowerCase().includes(q) ||
      (d.receiptNumber || '').toLowerCase().includes(q) ||
      d.donorName.toLowerCase().includes(q) ||
      d.memberId.toLowerCase().includes(q) ||
      (d.transactionReference || '').toLowerCase().includes(q);
    const matchesStatus =
      ledgerStatusFilter === 'all' || d.paymentStatus === ledgerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMembers = allMembers.filter((m) => {
    const q = memberSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.primaryMobile || '').includes(q) ||
      (m.district || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[10px] font-mono font-bold uppercase mb-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            <span>Backend Module Controller · Member (Foundation Supporter &amp; Donators Portal Only)</span>
          </div>
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
            Member &amp; Donators Portal Backend Command Module
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full backend management of Foundation Supporter &amp; Donor Member profiles, UPI/QR verifications, PDF invoices &amp; statutory receipts, recurring contribution plans, official QR settings, and portal UI customization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
          <span
            className={`px-3 py-1.5 rounded-lg border font-bold ${
              modCfg.moduleEnabled !== false
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            Module: {modCfg.moduleEnabled !== false ? 'ACTIVE' : 'MAINTENANCE'}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            Verified Donations: ₹{verifiedTotalInr.toLocaleString('en-IN')}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
            Awaiting Verification: {pendingSubmissionsCount}
          </span>
          <button
            type="button"
            disabled={isSyncingCloud}
            onClick={async () => {
              setIsSyncingCloud(true);
              const res = await DonatorsPortalService.forcePullFromCloud();
              setIsSyncingCloud(false);
              notifyBoth({
                type: res.success ? 'success' : 'error',
                text: res.message,
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>Sync Cloud</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
        {[
          {
            id: 'submissions',
            label: `Verification Queue (${pendingSubmissionsCount})`,
            icon: ShieldCheck,
          },
          {
            id: 'ledger',
            label: `Donations & PDF Receipts (${allDonations.length})`,
            icon: FileText,
          },
          {
            id: 'members',
            label: `Members CRUD (${allMembers.length})`,
            icon: Users,
          },
          {
            id: 'plans',
            label: `Contribution Plans (${allPlans.length})`,
            icon: CalendarClock,
          },
          {
            id: 'qr_settings',
            label: 'Official QR & Statutory Config',
            icon: QrCode,
          },
          {
            id: 'module_config',
            label: 'Portal UI & Causes Studio',
            icon: Sliders,
          },
          {
            id: 'audit',
            label: `Audit Log (${auditLogs.length})`,
            icon: History,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                active
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span className="font-semibold">{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: PAYMENT VERIFICATION QUEUE */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {allSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No payment confirmation submissions received yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Donor / Member ID</th>
                    <th className="py-2.5 px-3">Donation Ref</th>
                    <th className="py-2.5 px-3">UTR &amp; Date</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Evidence</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allSubmissions.map((sub) => (
                    <React.Fragment key={sub.submissionId}>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{sub.donorName}</div>
                          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                            {sub.memberId} · +91 {sub.registeredMobile}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold tabular-nums text-slate-900">
                          {sub.donationId}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900 tabular-nums">
                            {sub.transactionReference}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                            Paid: {sub.paymentDate}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          ₹{sub.submittedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          {sub.evidenceFileReference ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewEvidenceUrl(sub.evidenceFileReference || null)
                              }
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-[11px] cursor-pointer"
                            >
                              View Screenshot
                            </button>
                          ) : (
                            <span className="text-slate-400">No screenshot</span>
                          )}
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
                        <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                          {sub.verificationStatus === 'submitted_for_verification' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const res =
                                    DonatorsPortalService.adminVerifyPaymentSubmission({
                                      adminActor,
                                      submissionId: sub.submissionId,
                                    });
                                  if (res.success) {
                                    notifyBoth({
                                      type: 'success',
                                      text: `Verified payment ${sub.transactionReference} and issued Official Receipt ${res.donation?.receiptNumber}!`,
                                    });
                                  } else {
                                    notifyBoth({
                                      type: 'error',
                                      text: res.error || 'Verification failed.',
                                    });
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                              >
                                Verify &amp; Issue Receipt
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingSubmissionId(sub.submissionId);
                                  setRejectionReasonInput('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>

                      {rejectingSubmissionId === sub.submissionId && (
                        <tr className="bg-rose-50/60">
                          <td colSpan={7} className="p-3">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="text"
                                placeholder="Enter clear rejection reason for donor (e.g. Invalid UTR or transfer not found in bank statement)..."
                                value={rejectionReasonInput}
                                onChange={(e) => setRejectionReasonInput(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-white border border-rose-300 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const res =
                                    DonatorsPortalService.adminRejectPaymentSubmission({
                                      adminActor,
                                      submissionId: sub.submissionId,
                                      rejectionReason: rejectionReasonInput,
                                    });
                                  if (res.success) {
                                    setRejectingSubmissionId(null);
                                    notifyBoth({
                                      type: 'success',
                                      text: 'Submission rejected and donor notified.',
                                    });
                                  } else {
                                    notifyBoth({
                                      type: 'error',
                                      text: res.error || 'Could not reject submission.',
                                    });
                                  }
                                }}
                                className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                              >
                                Confirm Rejection
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingSubmissionId(null)}
                                className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DONATIONS LEDGER, MANUAL ENTRY & PDF RECEIPTS */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px] flex-1 max-w-xs">
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search donor, ref, invoice, UTR..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={ledgerStatusFilter}
                onChange={(e) => setLedgerStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="submitted_for_verification">Submitted for Verification</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="rejected">Rejected</option>
                <option value="refunded">Refunded / Reversed</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportDonationsCsv}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewDonationForm((prev) => ({
                    ...prev,
                    uid: allMembers[0]?.uid || '',
                  }));
                  setIsAddDonationOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Donation / Offline Entry</span>
              </button>
            </div>
          </div>

          {filteredDonations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No donations matching filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Donation Ref / Invoice</th>
                    <th className="py-2.5 px-3">Donor / Member</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Receipt / UTR</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Documents, PDF &amp; Reversal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonations.map((d) => (
                    <React.Fragment key={d.donationId}>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900 tabular-nums">
                            {d.donationId}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                            {d.invoiceNumber}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              const found = allMembers.find(
                                (m) => m.uid === d.uid || m.memberId === d.memberId
                              );
                              if (found) {
                                setSelectedMemberForModal(found);
                              } else {
                                // Synthetic member profile from donation record if not in full ledger
                                setSelectedMemberForModal({
                                  uid: d.uid,
                                  memberId: d.memberId,
                                  fullName: d.donorName,
                                  email: d.donorEmail,
                                  primaryMobile: d.donorMobile || '',
                                  memberCategory: 'donor_member',
                                  villageTownCity: 'Kalyani',
                                  district: 'Nadia',
                                  state: 'West Bengal',
                                  pinCode: '741235',
                                  profileCompletionStatus: 'completed',
                                  completionPercentage: 100,
                                  createdAt: d.createdAt,
                                  updatedAt: d.createdAt,
                                });
                              }
                            }}
                            className="text-left group cursor-pointer"
                            title="Click to view Member Complete Profile and Print ID Card"
                          >
                            <div className="font-semibold text-slate-900 group-hover:text-amber-600 group-hover:underline flex items-center gap-1">
                              <span>{d.donorName}</span>
                              <CreditCard className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                              {d.memberId}
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          ₹{d.amount.toLocaleString('en-IN')}
                          <div className="text-[10px] font-normal text-slate-500 uppercase">
                            {d.frequency}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                          <div>{d.receiptNumber || '—'}</div>
                          {d.transactionReference && (
                            <div className="text-[10px] text-slate-500">
                              UTR: {d.transactionReference}
                            </div>
                          )}
                          {d.reversalDocumentNumber && (
                            <div className="text-[10px] text-rose-700">
                              Rev: {d.reversalDocumentNumber}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold capitalize ${
                              d.paymentStatus === 'verified'
                                ? 'text-emerald-700'
                                : d.paymentStatus === 'refunded' || d.paymentStatus === 'rejected'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {d.paymentStatus.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setDocModalState({ donation: d, mode: 'invoice' })}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium cursor-pointer"
                          >
                            View Invoice
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDonationPdf(d, settings, 'invoice')}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium cursor-pointer"
                            title="Download Invoice PDF"
                          >
                            Invoice PDF
                          </button>
                          {d.receiptNumber && (
                            <>
                              <button
                                type="button"
                                onClick={() => setDocModalState({ donation: d, mode: 'receipt' })}
                                className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold cursor-pointer"
                              >
                                View Receipt
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadDonationPdf(d, settings, 'receipt')}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                                title="Download Official Receipt PDF"
                              >
                                Receipt PDF
                              </button>
                            </>
                          )}
                          {d.paymentStatus === 'verified' && (
                            <button
                              type="button"
                              onClick={() => {
                                setReversingDonationId(d.donationId);
                                setReversalReasonInput('');
                              }}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold cursor-pointer"
                            >
                              Refund / Reverse
                            </button>
                          )}
                          {d.paymentStatus === 'refunded' && d.reversalDocumentNumber && (
                            <button
                              type="button"
                              onClick={() => setDocModalState({ donation: d, mode: 'reversal' })}
                              className="px-2.5 py-1 rounded bg-rose-600 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Reversal Note
                            </button>
                          )}
                        </td>
                      </tr>

                      {reversingDonationId === d.donationId && (
                        <tr className="bg-rose-50/60">
                          <td colSpan={6} className="p-3">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="text"
                                placeholder="Reason for refund / reversal (Original receipt number will be preserved in audit history)..."
                                value={reversalReasonInput}
                                onChange={(e) => setReversalReasonInput(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-white border border-rose-300 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const res =
                                    DonatorsPortalService.adminRecordRefundOrReversal({
                                      adminActor,
                                      donationId: d.donationId,
                                      reversalReason: reversalReasonInput,
                                    });
                                  if (res.success) {
                                    setReversingDonationId(null);
                                    notifyBoth({
                                      type: 'success',
                                      text: `Recorded refund/reversal and generated Reversal Note ${res.donation?.reversalDocumentNumber}.`,
                                    });
                                  } else {
                                    notifyBoth({
                                      type: 'error',
                                      text: res.error || 'Could not record reversal.',
                                    });
                                  }
                                }}
                                className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                              >
                                Confirm Refund / Reversal
                              </button>
                              <button
                                type="button"
                                onClick={() => setReversingDonationId(null)}
                                className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEMBERS CRUD & MOBILE VERIFICATION */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search Member ID, name, email, mobile, district..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportMembersCsv}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Export Members CSV</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddMember}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member Profile</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3">Member ID</th>
                  <th className="py-2.5 px-3">Full Name &amp; Email</th>
                  <th className="py-2.5 px-3">Category &amp; Location</th>
                  <th className="py-2.5 px-3">Mobile Number</th>
                  <th className="py-2.5 px-3">Profile &amp; Mobile Status</th>
                  <th className="py-2.5 px-3 text-right">Backend Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.uid} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-slate-900">
                      {m.memberId}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberForModal(m)}
                        className="text-left group cursor-pointer"
                        title="Click to view Member Complete Profile and Print ID Card"
                      >
                        <div className="font-semibold text-slate-900 group-hover:text-amber-600 group-hover:underline flex items-center gap-1.5">
                          <span>{m.fullName}</span>
                          <CreditCard className="w-3.5 h-3.5 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[11px] text-slate-500">{m.email}</div>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="font-semibold uppercase text-[10px] text-amber-800">
                        {m.memberCategory?.replace(/_/g, ' ')}
                      </div>
                      <div>
                        {[m.villageTownCity, m.district, m.state].filter(Boolean).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-900">
                      {m.primaryMobile ? `+91 ${m.primaryMobile}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`font-semibold capitalize ${
                            m.verifiedContactMetadata?.isVerified
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          Mobile:{' '}
                          {m.verifiedContactMetadata?.verificationStatus?.replace(/_/g, ' ') ||
                            'unverified'}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          Wizard: {m.profileCompletionStatus} ({m.completionPercentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberForModal(m)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        title="View Complete Profile & Print Official Member ID Card (PDF)"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                        <span>ID Card</span>
                      </button>
                      {!m.verifiedContactMetadata?.isVerified && m.primaryMobile && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = DonatorsPortalService.adminVerifyMemberMobile(
                              adminActor,
                              m.uid
                            );
                            if (res.success) {
                              notifyBoth({
                                type: 'success',
                                text: `Verified mobile number +91 ${m.primaryMobile} for ${m.fullName}.`,
                              });
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                        >
                          Verify Mobile
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditMember(m)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer inline-flex items-center"
                        title="Edit Member Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const res = DonatorsPortalService.adminDeleteMemberProfile(
                            adminActor,
                            m.uid
                          );
                          if (res.success) {
                            notifyBoth({
                              type: 'success',
                              text: `Removed Member profile ${m.fullName} (${m.memberId}).`,
                            });
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer inline-flex items-center"
                        title="Delete Member Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RECURRING CONTRIBUTION PLANS MANAGEMENT */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {allPlans.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No recurring member contribution plans registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Plan ID</th>
                    <th className="py-2.5 px-3">Donor / Member ID</th>
                    <th className="py-2.5 px-3 text-right">Commitment</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    <th className="py-2.5 px-3">Next Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allPlans.map((p) => (
                    <tr key={p.planId} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {p.planId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{p.donorName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{p.memberId}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{p.amount.toLocaleString('en-IN')} / {p.frequency}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {p.purpose}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {p.nextSuggestedPaymentDate}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'paused'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPlan({ ...p })}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Plan</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: OFFICIAL QR CODE, PREFIXES & STATUTORY RECEIPT SETTINGS */}
      {activeTab === 'qr_settings' && (
        <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
              <div className="font-bold text-slate-900">
                Official MADEN FAF Donation QR Code
              </div>
              <div className="w-48 h-48 mx-auto rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-center">
                {qrUrlInput ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrUrlInput}
                    alt="Official QR Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    Default Vector UPI QR Active (Or Upload Custom Image)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR Image</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleQrFileUpload}
                    className="hidden"
                  />
                </label>
                {qrUrlInput && (
                  <button
                    type="button"
                    onClick={() => setQrUrlInput('')}
                    className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 font-semibold cursor-pointer"
                  >
                    Reset QR
                  </button>
                )}
              </div>

              <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={qrActiveInput}
                  onChange={(e) => setQrActiveInput(e.target.checked)}
                  className="rounded text-slate-900"
                />
                <span>Official QR Code Active on Donators Portal</span>
              </label>

              <div className="pt-3 border-t border-slate-200 text-left space-y-2">
                <label className="block font-semibold text-slate-700">
                  Allowed Contribution Frequencies
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['monthly', 'quarterly', 'yearly'] as DonationFrequency[]).map((freq) => {
                    const checked = allowedFreqs.includes(freq);
                    return (
                      <label
                        key={freq}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer capitalize font-semibold"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setAllowedFreqs((prev) =>
                              prev.includes(freq)
                                ? prev.filter((f) => f !== freq)
                                : [...prev, freq]
                            );
                          }}
                        />
                        <span>{freq}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Preset Amounts (CSV INR)
                  </label>
                  <input
                    type="text"
                    value={presetsCsvInput}
                    onChange={(e) => setPresetsCsvInput(e.target.value)}
                    placeholder="500, 1000, 2500, 5000, 10000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Min Custom (INR)
                  </label>
                  <input
                    type="number"
                    value={minCustomInput}
                    onChange={(e) => setMinCustomInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Custom (INR)
                  </label>
                  <input
                    type="number"
                    value={maxCustomInput}
                    onChange={(e) => setMaxCustomInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Document Prefixes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefixInput}
                    onChange={(e) => setInvoicePrefixInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Receipt Prefix
                  </label>
                  <input
                    type="text"
                    value={receiptPrefixInput}
                    onChange={(e) => setReceiptPrefixInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reversal Note Prefix
                  </label>
                  <input
                    type="text"
                    value={reversalPrefixInput}
                    onChange={(e) => setReversalPrefixInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Organization Legal & Receipt Identity */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900">
                  Foundation Legal Details &amp; Statutory PDF Receipt Header/Footer
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Foundation Legal Name
                    </label>
                    <input
                      type="text"
                      value={legalNameInput}
                      onChange={(e) => setLegalNameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Registration Number (Section 8 / Trust)
                    </label>
                    <input
                      type="text"
                      value={regNumberInput}
                      onChange={(e) => setRegNumberInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Registered Office Address (Printed on PDF Invoices &amp; Receipts)
                    </label>
                    <input
                      type="text"
                      value={regAddressInput}
                      onChange={(e) => setRegAddressInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Official Foundation Email
                    </label>
                    <input
                      type="email"
                      value={officialEmailInput}
                      onChange={(e) => setOfficialEmailInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Official Helpline Phone
                    </label>
                    <input
                      type="text"
                      value={officialPhoneInput}
                      onChange={(e) => setOfficialPhoneInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Authorized Signatory Name
                    </label>
                    <input
                      type="text"
                      value={signatoryNameInput}
                      onChange={(e) => setSignatoryNameInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Authorized Signatory Title
                    </label>
                    <input
                      type="text"
                      value={signatoryTitleInput}
                      onChange={(e) => setSignatoryTitleInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Foundation PAN Number
                    </label>
                    <input
                      type="text"
                      value={panInput}
                      onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                      placeholder="e.g. AAATM1234F"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Verified 80G Registration Number
                    </label>
                    <input
                      type="text"
                      value={tax80gRegInput}
                      onChange={(e) => setTax80gRegInput(e.target.value)}
                      placeholder="Only if 80G approved"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-slate-800 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={tax80gVerifiedInput}
                    onChange={(e) => setTax80gVerifiedInput(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span>
                    Enable Section 80G Tax Exemption statement on official receipts
                  </span>
                </label>
              </div>

              {/* Step-by-step UPI Instructions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Step-by-Step QR Payment Instructions (One instruction per line)
                </label>
                <textarea
                  rows={4}
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Official QR &amp; Statutory Configuration</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 6: PORTAL MODULE & UI CUSTOMIZATION STUDIO */}
      {activeTab === 'module_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          <form
            onSubmit={handleSaveModuleConfig}
            className="lg:col-span-7 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-black uppercase text-slate-900">
                  Member Portal UI, Headlines &amp; Causes Studio
                </h4>
                <p className="text-[11px] text-slate-500">
                  Customize headlines, announcement banners, header CTA buttons, donation causes, and profile wizard options.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moduleEnabledInput}
                  onChange={(e) => setModuleEnabledInput(e.target.checked)}
                />
                <span>Portal Module Enabled</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Member Portal Welcome Headline
                </label>
                <input
                  type="text"
                  value={portalHeadlineInput}
                  onChange={(e) => setPortalHeadlineInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Member Portal Subheadline
                </label>
                <input
                  type="text"
                  value={portalSubheadlineInput}
                  onChange={(e) => setPortalSubheadlineInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Live Portal Announcement Banner (Displayed at top of Member Dashboard)
                </label>
                <textarea
                  rows={2}
                  value={portalBannerInput}
                  onChange={(e) => setPortalBannerInput(e.target.value)}
                  placeholder="Optional announcement for logged-in Foundation Supporters & Donors..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Primary Header CTA Button Label
                </label>
                <input
                  type="text"
                  value={primaryCtaInput}
                  onChange={(e) => setPrimaryCtaInput(e.target.value)}
                  placeholder="Visit Our Academy"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Secondary Header CTA Button Label
                </label>
                <input
                  type="text"
                  value={secondaryCtaInput}
                  onChange={(e) => setSecondaryCtaInput(e.target.value)}
                  placeholder="See Your Digital Profile"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-semibold"
                />
              </div>
            </div>

            {/* Selectable Donation Purposes */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block font-bold text-slate-700">
                Selectable Donation Causes / Purposes ({purposesList.length})
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPurposeInput}
                  onChange={(e) => setNewPurposeInput(e.target.value)}
                  placeholder="Add new donation cause / purpose..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPurposeInput.trim()) return;
                    setPurposesList([...purposesList, newPurposeInput.trim()]);
                    setNewPurposeInput('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  + Add Cause
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {purposesList.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPurposesList(purposesList.filter((_, i) => i !== idx))
                      }
                      className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Selectable Football Interest Areas */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="block font-bold text-slate-700">
                Wizard Step 3 Football Interest Areas ({interestsList.length})
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  placeholder="Add new football interest area..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newInterestInput.trim()) return;
                    setInterestsList([...interestsList, newInterestInput.trim()]);
                    setNewInterestInput('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  + Add Area
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {interestsList.map((area, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setInterestsList(interestsList.filter((_, i) => i !== idx))
                      }
                      className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Portal Module Configuration</span>
            </button>
          </form>

          {/* Direct / Broadcast Notification Dispatcher */}
          <form
            onSubmit={handleSendNotification}
            className="lg:col-span-5 space-y-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 self-start"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-black uppercase tracking-tight">
                Dispatch Member Portal Notification
              </h4>
            </div>
            <p className="text-[11px] text-slate-400">
              Send an instant in-portal notification to a specific Foundation Supporter / Donor or broadcast to all registered Members.
            </p>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                Target Recipient
              </label>
              <select
                value={notifTargetUid}
                onChange={(e) => setNotifTargetUid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value="ALL_MEMBERS">
                  All Registered Members ({allMembers.length} Accounts)
                </option>
                {allMembers.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.fullName} ({m.memberId} · {m.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                required
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. Annual Foundation Impact Report Published"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                Notification Message
              </label>
              <textarea
                rows={3}
                required
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Write message for Foundation Supporters & Donors..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch to Member Portal</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: ADMIN AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No administrative actions logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.logId}>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">
                        {log.actorEmail}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {log.targetId}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT MEMBER PROFILE */}
      {isMemberModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"
          onClick={() => setIsMemberModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900">
                {editingMemberForm.uid
                  ? `Edit Member Profile (${editingMemberForm.memberId})`
                  : 'Create New Member Profile (Donators Portal)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberModal} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingMemberForm.fullName}
                    onChange={(e) =>
                      setEditingMemberForm({
                        ...editingMemberForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingMemberForm.email}
                    onChange={(e) =>
                      setEditingMemberForm({ ...editingMemberForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    10-Digit Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editingMemberForm.primaryMobile}
                    onChange={(e) =>
                      setEditingMemberForm({
                        ...editingMemberForm,
                        primaryMobile: e.target.value,
                      })
                    }
                    placeholder="9830112233"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Member Category
                  </label>
                  <select
                    value={editingMemberForm.memberCategory}
                    onChange={(e) =>
                      setEditingMemberForm({
                        ...editingMemberForm,
                        memberCategory: e.target.value as MemberCategory,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="individual">Individual Supporter</option>
                    <option value="patron">Foundation Patron</option>
                    <option value="alumni_supporter">Alumni Supporter</option>
                    <option value="institutional">Institutional / CSR Donor</option>
                    <option value="youth_student">Youth / Student Member</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editingMemberForm.occupation}
                    onChange={(e) =>
                      setEditingMemberForm({
                        ...editingMemberForm,
                        occupation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    House &amp; Street
                  </label>
                  <input
                    type="text"
                    value={editingMemberForm.houseAndStreet}
                    onChange={(e) =>
                      setEditingMemberForm({
                        ...editingMemberForm,
                        houseAndStreet: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City / Town / Village
                  </label>
                  <input
                    type="text"
                    value={editingMemberForm.villageTownCity}
                    onChange={(e) =>
                      setEditingMemberForm({
                        ...editingMemberForm,
                        villageTownCity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    District &amp; PIN Code
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingMemberForm.district}
                      onChange={(e) =>
                        setEditingMemberForm({
                          ...editingMemberForm,
                          district: e.target.value,
                        })
                      }
                      placeholder="District"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                    <input
                      type="text"
                      value={editingMemberForm.pinCode}
                      onChange={(e) =>
                        setEditingMemberForm({
                          ...editingMemberForm,
                          pinCode: e.target.value,
                        })
                      }
                      placeholder="PIN Code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Profile Completion Status
                  </label>
                  <select
                    value={editingMemberForm.profileCompletionStatus}
                    onChange={(e) =>
                      setEditingMemberForm({
                        ...editingMemberForm,
                        profileCompletionStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="complete">Complete (100%)</option>
                    <option value="draft">Draft</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingMemberForm.isMobileVerified}
                      onChange={(e) =>
                        setEditingMemberForm({
                          ...editingMemberForm,
                          isMobileVerified: e.target.checked,
                        })
                      }
                    />
                    <span>Mark Mobile Number as Admin Verified</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider cursor-pointer"
                >
                  Save Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD NEW / OFFLINE DONATION */}
      {isAddDonationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"
          onClick={() => setIsAddDonationOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900">
                Record Member Contribution (Backend Entry)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDonationOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualDonation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Registered Member *
                </label>
                <select
                  required
                  value={newDonationForm.uid}
                  onChange={(e) =>
                    setNewDonationForm({ ...newDonationForm, uid: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {allMembers.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.fullName} ({m.memberId} · {m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newDonationForm.amount}
                    onChange={(e) =>
                      setNewDonationForm({ ...newDonationForm, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={newDonationForm.frequency}
                    onChange={(e) =>
                      setNewDonationForm({
                        ...newDonationForm,
                        frequency: e.target.value as DonationFrequency,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contribution Purpose
                </label>
                <input
                  type="text"
                  value={newDonationForm.purpose}
                  onChange={(e) =>
                    setNewDonationForm({ ...newDonationForm, purpose: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newDonationForm.paymentStatus}
                    onChange={(e) =>
                      setNewDonationForm({
                        ...newDonationForm,
                        paymentStatus: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="verified">Verified (Issue Receipt Now)</option>
                    <option value="awaiting_payment">Awaiting Payment (Invoice Only)</option>
                    <option value="submitted_for_verification">
                      Submitted for Verification
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={newDonationForm.paymentDate}
                    onChange={(e) =>
                      setNewDonationForm({
                        ...newDonationForm,
                        paymentDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  UTR / Bank Reference (Optional)
                </label>
                <input
                  type="text"
                  value={newDonationForm.transactionReference}
                  onChange={(e) =>
                    setNewDonationForm({
                      ...newDonationForm,
                      transactionReference: e.target.value,
                    })
                  }
                  placeholder="12-digit UPI UTR or bank transfer reference"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDonationOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider cursor-pointer"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CONTRIBUTION PLAN */}
      {editingPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"
          onClick={() => setEditingPlan(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900">
                Edit Plan: {editingPlan.planId}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingPlan.amount}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, amount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={editingPlan.frequency}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        frequency: e.target.value as DonationFrequency,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Status</label>
                  <select
                    value={editingPlan.status}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        status: e.target.value as 'active' | 'paused' | 'cancelled',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={editingPlan.nextSuggestedPaymentDate}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        nextSuggestedPaymentDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Purpose</label>
                <input
                  type="text"
                  value={editingPlan.purpose}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, purpose: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider cursor-pointer"
                >
                  Save Plan Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewEvidenceUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"
          onClick={() => setPreviewEvidenceUrl(null)}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-lg w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">
                Submitted Payment Screenshot (Verification Aid Only)
              </span>
              <button
                type="button"
                onClick={() => setPreviewEvidenceUrl(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex justify-center bg-slate-50 rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewEvidenceUrl}
                alt="Submitted Payment Screenshot"
                referrerPolicy="no-referrer"
                className="max-w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {docModalState && (
        <DonationDocumentViewer
          donation={docModalState.donation}
          settings={settings}
          mode={docModalState.mode}
          onClose={() => setDocModalState(null)}
        />
      )}

      {selectedMemberForModal && (
        <MemberProfileDetailModal
          member={selectedMemberForModal}
          isOpen={Boolean(selectedMemberForModal)}
          onClose={() => setSelectedMemberForModal(null)}
          onEdit={(m) => {
            setSelectedMemberForModal(null);
            handleOpenEditMember(m);
          }}
          settings={settings}
          donations={allDonations}
        />
      )}
    </div>
  );
};
