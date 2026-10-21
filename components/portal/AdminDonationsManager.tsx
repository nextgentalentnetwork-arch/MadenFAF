'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { UserProfile } from '@/lib/AuthContext';
import {
  DonatorsPortalService,
  subscribeDonatorsPortal,
  DonationRecordItem,
  DEFAULT_ORG_PAYMENT_SETTINGS,
  maskIndianMobile,
} from '@/lib/donatorsPortalService';
import {
  DonationDocumentViewer,
  DocumentViewMode,
} from '@/components/membership/DonationDocumentViewer';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Upload,
  ShieldCheck,
  Users,
  Phone,
  Settings,
  History,
  AlertCircle,
  Eye,
  Save,
} from 'lucide-react';

interface AdminDonationsManagerProps {
  profile: UserProfile;
}

export const AdminDonationsManager: React.FC<AdminDonationsManagerProps> = ({ profile }) => {
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
        (localStorage.getItem('maden_faf_payment_submissions_v1') || '') +
        (localStorage.getItem('maden_faf_org_payment_settings_v1') || '') +
        (localStorage.getItem('maden_faf_donor_admin_audit_logs_v1') || '')
      );
    },
    () => 'server'
  );

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

  const auditLogs = React.useMemo(
    () => DonatorsPortalService.getAdminAuditLogs(profile.role),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [portalTick, profile.role]
  );

  const [activeTab, setActiveTab] = useState<
    'submissions' | 'ledger' | 'qr_settings' | 'members' | 'audit'
  >('submissions');

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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

  // Editable Payment Settings State
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
  const [tax80gVerifiedInput, setTax80gVerifiedInput] = useState<boolean>(
    settings.organizationDisplayDetails.tax80gVerified
  );
  const [tax80gRegInput, setTax80gRegInput] = useState<string>(
    settings.organizationDisplayDetails.tax80gRegistrationNumber
  );
  const [panInput, setPanInput] = useState<string>(
    settings.organizationDisplayDetails.panNumber
  );

  const adminActor = {
    uid: profile.id,
    email: profile.email,
    role: profile.role,
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setFeedback({
        type: 'error',
        text: 'Official QR code image must be a PNG, JPG, or WEBP file.',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({
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
      setFeedback({
        type: 'error',
        text: 'Please provide at least one valid preset donation amount.',
      });
      return;
    }

    const res = DonatorsPortalService.updatePaymentSettings(adminActor, {
      officialQrCodeUrl: qrUrlInput,
      activeStatus: qrActiveInput,
      presetAmounts: parsedPresets,
      minCustomAmount: Math.max(1, Math.round(Number(minCustomInput) || 100)),
      maxCustomAmount: Math.max(100, Math.round(Number(maxCustomInput) || 500000)),
      organizationDisplayDetails: {
        ...settings.organizationDisplayDetails,
        panNumber: panInput.trim(),
        tax80gVerified: tax80gVerifiedInput,
        tax80gRegistrationNumber: tax80gRegInput.trim(),
      },
    });

    if (res.success) {
      setFeedback({
        type: 'success',
        text: 'Official QR code and payment configuration saved.',
      });
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to update settings.' });
    }
  };

  const pendingSubmissionsCount = allSubmissions.filter(
    (s) => s.verificationStatus === 'submitted_for_verification'
  ).length;

  const verifiedTotalInr = allDonations
    .filter((d) => d.paymentStatus === 'verified')
    .reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Donators Portal Administration &amp; Official QR Payment Governance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify submitted UPI UTRs, issue official receipts, manage the official MADEN FAF QR code, verify donor mobile numbers, and audit reversals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            Verified Donations: ₹{verifiedTotalInr.toLocaleString('en-IN')}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
            Awaiting Verification: {pendingSubmissionsCount}
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
        {[
          {
            id: 'submissions',
            label: `Verification Queue (${pendingSubmissionsCount})`,
            icon: ShieldCheck,
          },
          {
            id: 'ledger',
            label: `Donations & Refunds (${allDonations.length})`,
            icon: FileText,
          },
          { id: 'qr_settings', label: 'Official QR & Payment Config', icon: QrCode },
          { id: 'members', label: `Members & Mobile (${allMembers.length})`, icon: Users },
          { id: 'audit', label: `Admin Audit Log (${auditLogs.length})`, icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
          <span>{feedback.text}</span>
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
                                    setFeedback({
                                      type: 'success',
                                      text: `Verified payment ${sub.transactionReference} and issued Official Receipt ${res.donation?.receiptNumber}!`,
                                    });
                                  } else {
                                    setFeedback({
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
                                    setFeedback({
                                      type: 'success',
                                      text: 'Submission rejected and donor notified.',
                                    });
                                  } else {
                                    setFeedback({
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

      {/* TAB 2: DONATIONS LEDGER & REFUND/REVERSAL MANAGEMENT */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {allDonations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No donations in ledger.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3">Donation Ref / Invoice</th>
                    <th className="py-2.5 px-3">Donor / Member</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Receipt / Reversal No.</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Documents &amp; Reversal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allDonations.map((d) => (
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
                          <div className="font-semibold text-slate-900">{d.donorName}</div>
                          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                            {d.memberId}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                          ₹{d.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                          {d.receiptNumber || '—'}
                          {d.reversalDocumentNumber ? ` / ${d.reversalDocumentNumber}` : ''}
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
                            Invoice
                          </button>
                          {d.receiptNumber && (
                            <button
                              type="button"
                              onClick={() => setDocModalState({ donation: d, mode: 'receipt' })}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Receipt
                            </button>
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
                              Record Refund / Reversal
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
                                    setFeedback({
                                      type: 'success',
                                      text: `Recorded refund/reversal and generated Reversal Note ${res.donation?.reversalDocumentNumber}.`,
                                    });
                                  } else {
                                    setFeedback({
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

      {/* TAB 3: OFFICIAL QR CODE & PAYMENT SETTINGS */}
      {activeTab === 'qr_settings' && (
        <form onSubmit={handleSavePaymentSettings} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-center">
              <div className="font-semibold text-slate-900">
                Official MADEN FAF Donation QR Code Preview
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
                    No Official QR Image Uploaded Yet
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Official QR Image</span>
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
                    Remove QR
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
            </div>

            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Selectable Preset Donation Amounts (Comma-separated INR)
                </label>
                <input
                  type="text"
                  value={presetsCsvInput}
                  onChange={(e) => setPresetsCsvInput(e.target.value)}
                  placeholder="500, 1000, 2500, 5000, 10000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimum Custom Donation (INR)
                  </label>
                  <input
                    type="number"
                    value={minCustomInput}
                    onChange={(e) => setMinCustomInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Maximum Custom Donation (INR)
                  </label>
                  <input
                    type="number"
                    value={maxCustomInput}
                    onChange={(e) => setMaxCustomInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-semibold text-slate-900">
                  Statutory PAN &amp; Section 80G Receipt Configuration
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Foundation PAN Number (Optional)
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
                <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tax80gVerifiedInput}
                    onChange={(e) => setTax80gVerifiedInput(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span>
                    Enable Section 80G Tax Exemption statement on official receipts (Only check if verified)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Official QR &amp; Payment Configuration</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: MEMBERS & MOBILE VERIFICATION QUEUE */}
      {activeTab === 'members' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3">Member ID</th>
                <th className="py-2.5 px-3">Full Name &amp; Email</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Mobile Number</th>
                <th className="py-2.5 px-3">Mobile Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allMembers.map((m) => (
                <tr key={m.uid} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold tabular-nums text-slate-900">
                    {m.memberId}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{m.fullName}</div>
                    <div className="text-[11px] text-slate-500">{m.email}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {[m.villageTownCity, m.district, m.state].filter(Boolean).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-900">
                    {m.primaryMobile ? `+91 ${m.primaryMobile}` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold capitalize ${
                        m.verifiedContactMetadata?.isVerified
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {m.verifiedContactMetadata?.verificationStatus?.replace(/_/g, ' ') ||
                        'unverified'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {!m.verifiedContactMetadata?.isVerified && m.primaryMobile && (
                      <button
                        type="button"
                        onClick={() => {
                          const res = DonatorsPortalService.adminVerifyMemberMobile(
                            adminActor,
                            m.uid
                          );
                          if (res.success) {
                            setFeedback({
                              type: 'success',
                              text: `Verified mobile number +91 ${m.primaryMobile} for ${m.fullName}.`,
                            });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer"
                      >
                        Verify Mobile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: ADMIN AUDIT LOG */}
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
    </div>
  );
};
