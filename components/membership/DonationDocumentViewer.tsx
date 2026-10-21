'use client';

import React, { useState } from 'react';
import {
  DonationRecordItem,
  OrganizationPaymentSettings,
  maskIndianMobile,
} from '@/lib/donatorsPortalService';
import {
  downloadDonationPdf,
  printElementInIsolatedIframe,
} from '@/lib/pdfDocumentGenerator';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  RotateCcw,
  FileCheck2,
} from 'lucide-react';

export type DocumentViewMode = 'invoice' | 'receipt' | 'reversal';

interface DonationDocumentViewerProps {
  donation: DonationRecordItem;
  settings: OrganizationPaymentSettings;
  mode: DocumentViewMode;
  onClose: () => void;
}

export const DonationDocumentViewer: React.FC<DonationDocumentViewerProps> = ({
  donation,
  settings,
  mode,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<DocumentViewMode>(mode);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const org = settings.organizationDisplayDetails;
  const isReceiptAllowed =
    donation.paymentStatus === 'verified' ||
    (donation.paymentStatus === 'refunded' && Boolean(donation.receiptNumber));
  const isReversalAllowed =
    donation.paymentStatus === 'refunded' && Boolean(donation.reversalDocumentNumber);

  // Enforce strict rule: Official Donation Receipt can NEVER be viewed/downloaded for unverified payments
  const effectiveMode: DocumentViewMode =
    activeMode === 'receipt' && !isReceiptAllowed
      ? 'invoice'
      : activeMode === 'reversal' && !isReversalAllowed
      ? 'invoice'
      : activeMode;

  const docNumber =
    effectiveMode === 'receipt'
      ? donation.receiptNumber || 'PENDING'
      : effectiveMode === 'reversal'
      ? donation.reversalDocumentNumber || 'REV-NOTE'
      : donation.invoiceNumber;

  const docDate =
    effectiveMode === 'receipt'
      ? donation.verifiedAt || donation.paymentDate || donation.updatedAt
      : effectiveMode === 'reversal'
      ? donation.reversedAt || donation.updatedAt
      : donation.createdAt;

  const formattedDate = new Date(docDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleDownloadPdf = () => {
    downloadDonationPdf(donation, settings, effectiveMode);
    setDownloadNotice(`${docNumber}.pdf downloaded successfully.`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  const handlePrintA4 = () => {
    printElementInIsolatedIframe(
      'maden-printable-donation-document',
      `${docNumber} - ${org.legalName}`
    );
  };

  const handleDownloadHtmlCopy = () => {
    const printArea = document.getElementById('maden-printable-donation-document');
    if (!printArea) return;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${docNumber} - ${org.legalName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; padding: 32px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;">
    ${printArea.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            {effectiveMode === 'receipt' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : effectiveMode === 'reversal' ? (
              <RotateCcw className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold tracking-wide">
                {effectiveMode === 'receipt'
                  ? 'Official Verified Donation Receipt (A4 PDF Ready)'
                  : effectiveMode === 'reversal'
                  ? 'Official Contribution Reversal / Refund Note'
                  : 'Donation Invoice & Payment Instruction'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                {docNumber} · Ref: {donation.donationId}
              </div>
            </div>
          </div>

          {/* Document Mode Switcher + Download / Print Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isReceiptAllowed && (
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 mr-1">
                <button
                  type="button"
                  onClick={() => setActiveMode('invoice')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                    effectiveMode === 'invoice'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('receipt')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                    effectiveMode === 'receipt'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Official Receipt
                </button>
                {isReversalAllowed && (
                  <button
                    type="button"
                    onClick={() => setActiveMode('reversal')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                      effectiveMode === 'reversal'
                        ? 'bg-rose-500 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Reversal
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF (.pdf)</span>
            </button>

            <button
              type="button"
              onClick={handlePrintA4}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtmlCopy}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
              title="Download Printable HTML Copy"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HTML</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close document preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="px-5 py-2 bg-emerald-950 text-emerald-200 text-xs flex items-center justify-between border-b border-emerald-800 print:hidden">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {downloadNotice}
            </span>
            <span className="font-mono text-[11px] text-emerald-400">A4 Print-Ready PDF 1.4</span>
          </div>
        )}

        {/* Printable Document Canvas */}
        <div
          id="maden-printable-donation-document"
          className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-900 bg-white flex-1"
        >
          {/* Organization Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/maden-faf-official-logo.png"
                  alt={org.brandName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {org.legalName}
                </h1>
                <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                  {org.registeredAddress}
                </p>
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span>Email: {org.officialEmail}</span>
                  <span aria-hidden="true">·</span>
                  <span>Phone: {org.officialPhone}</span>
                  <span aria-hidden="true">·</span>
                  <span>Web: {org.website}</span>
                </div>
                {org.registrationNumber && (
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    Reg. No: {org.registrationNumber}
                    {org.panNumber ? ` · PAN: ${org.panNumber}` : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="sm:text-right space-y-1 shrink-0">
              <div className="text-xs font-semibold text-slate-500">
                {effectiveMode === 'receipt'
                  ? 'OFFICIAL DONATION RECEIPT'
                  : effectiveMode === 'reversal'
                  ? 'REVERSAL / REFUND NOTE'
                  : 'DONATION INVOICE / INSTRUCTION'}
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                {docNumber}
              </div>
              <div className="text-xs text-slate-500 tabular-nums">Date: {formattedDate}</div>
              <div className="text-xs font-medium pt-1">
                {effectiveMode === 'receipt' && donation.paymentStatus === 'verified' && (
                  <span className="text-emerald-700 font-semibold">
                    Status: VERIFIED &amp; PAID
                  </span>
                )}
                {effectiveMode === 'receipt' && donation.paymentStatus === 'refunded' && (
                  <span className="text-rose-700 font-semibold">
                    Status: REVERSED / REFUNDED (Retained for Audit)
                  </span>
                )}
                {effectiveMode === 'reversal' && (
                  <span className="text-rose-700 font-semibold">
                    Status: REFUNDED / REVERSED
                  </span>
                )}
                {effectiveMode === 'invoice' && (
                  <span className="text-amber-700 font-semibold">
                    Status: {donation.paymentStatus.replace(/_/g, ' ').toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mandatory Legal Distinction Notice */}
          {effectiveMode === 'invoice' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">
                  Important Notice: Payment Instruction / Donation Invoice Only
                </div>
                <p className="leading-relaxed text-amber-800">
                  This document ({donation.invoiceNumber}) is a scheduled contribution invoice and payment instruction.{' '}
                  <strong>It is NOT an official donation receipt or proof that funds have been received.</strong>{' '}
                  An official receipt is issued strictly after your UPI transfer is verified by MADEN FAF Administration.
                </p>
              </div>
            </div>
          )}

          {effectiveMode === 'receipt' && donation.paymentStatus === 'verified' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">
                  Verified Contribution Receipt — Confirmed by MADEN FAF Administration
                </div>
                <p className="leading-relaxed text-emerald-800">
                  We gratefully acknowledge receipt of{' '}
                  <strong className="font-mono">₹{donation.amount.toLocaleString('en-IN')}.00</strong>{' '}
                  ({donation.amountInWords}) from <strong>{donation.donorName}</strong> (Member ID:{' '}
                  <span className="font-mono font-semibold">{donation.memberId}</span>) against Invoice{' '}
                  <span className="font-mono font-semibold">{donation.invoiceNumber}</span>.
                </p>
              </div>
            </div>
          )}

          {effectiveMode === 'receipt' && donation.paymentStatus === 'refunded' && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">
                  Audit Notice: Contribution Refunded / Reversed ({donation.reversalDocumentNumber})
                </div>
                <p className="leading-relaxed text-rose-800">
                  This original receipt ({donation.receiptNumber}) is retained for audit trail integrity, but the underlying payment was reversed/refunded on{' '}
                  {donation.reversedAt ? new Date(donation.reversedAt).toLocaleDateString('en-IN') : 'record'}. Reason: &ldquo;{donation.reversalReason}&rdquo;.
                </p>
              </div>
            </div>
          )}

          {effectiveMode === 'reversal' && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">
                  Official Contribution Reversal &amp; Refund Record
                </div>
                <p className="leading-relaxed text-rose-800">
                  This document certifies that the previously verified donation (Original Receipt:{' '}
                  <span className="font-mono font-semibold">{donation.receiptNumber}</span>, Original Invoice:{' '}
                  <span className="font-mono font-semibold">{donation.invoiceNumber}</span>) has been reversed/refunded. Reason: &ldquo;{donation.reversalReason}&rdquo;.
                </p>
              </div>
            </div>
          )}

          {/* Donor & Reference Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-500">
                Donor &amp; Member Details
              </div>
              <div className="text-sm font-bold text-slate-900">{donation.donorName}</div>
              <div className="text-slate-700 font-mono tabular-nums">
                Member ID: <span className="font-semibold">{donation.memberId}</span>
              </div>
              <div className="text-slate-600 leading-relaxed">
                Address: {donation.donorAddress || 'On File'}
              </div>
              <div className="text-slate-600 font-mono tabular-nums">
                Mobile: {maskIndianMobile(donation.donorMobile)} ({donation.mobileVerificationStatus.replace(/_/g, ' ')})
              </div>
              <div className="text-slate-600">Email: {donation.donorEmail}</div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-500">
                Contribution &amp; Verification Metadata
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/70">
                <span className="text-slate-500">Donation Reference:</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {donation.donationId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/70">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono tabular-nums text-slate-800">
                  {donation.invoiceNumber}
                </span>
              </div>
              {donation.receiptNumber && (
                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500">Official Receipt No:</span>
                  <span className="font-mono font-semibold tabular-nums text-emerald-700">
                    {donation.receiptNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-200/70">
                <span className="text-slate-500">Contribution Plan:</span>
                <span className="font-semibold capitalize text-slate-800">
                  {donation.frequency} Commitment
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/70">
                <span className="text-slate-500">Payment Method:</span>
                <span className="text-slate-800">Official MADEN FAF QR / UPI</span>
              </div>
              {donation.transactionReference && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">UPI / UTR Reference:</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">
                    {donation.transactionReference}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Line Item Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4">Contribution Description &amp; Purpose</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">
                      Foundation Grassroots &amp; Youth Football Development Contribution
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      Purpose: {donation.purpose || 'General Foundation Support'}
                    </div>
                  </td>
                  <td className="py-4 px-4 capitalize text-slate-700">{donation.frequency}</td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-sm tabular-nums text-slate-900">
                    ₹{donation.amount.toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={2} className="py-3 px-4 font-semibold text-slate-700">
                    {effectiveMode === 'receipt'
                      ? 'Total Verified Contribution Received'
                      : effectiveMode === 'reversal'
                      ? 'Total Contribution Amount Reversed / Refunded'
                      : 'Total Contribution Due'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-base tabular-nums text-slate-950">
                    ₹{donation.amount.toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Words */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-500 font-medium">Amount in Words: </span>
              <span className="font-semibold text-slate-900">{donation.amountInWords}</span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 tabular-nums">
              Currency: {donation.currency}
            </div>
          </div>

          {/* Tax / 80G & Verification Signatory Footer */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end text-xs">
            <div className="space-y-1.5 text-slate-600">
              {org.tax80gVerified && org.tax80gRegistrationNumber ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="font-semibold">80G Tax Exemption Details</div>
                  <div className="text-[11px] font-mono mt-0.5">
                    80G Reg. No: {org.tax80gRegistrationNumber}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Note: Contributions support grassroots youth football training, player welfare, and scholarship programs at {org.legalName}. Tax-deduction status under Section 80G is applicable only when explicitly stated with a verified 80G registration number.
                </p>
              )}
              {donation.verifiedBy && (
                <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                  Verified By: {donation.verifiedBy} ·{' '}
                  {donation.verifiedAt
                    ? new Date(donation.verifiedAt).toLocaleString('en-IN')
                    : ''}
                </div>
              )}
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-block border-b border-slate-300 pb-2 px-4">
                <div className="font-serif italic text-sm text-slate-800">
                  {org.authorizedSignatoryName}
                </div>
              </div>
              <div className="font-semibold text-slate-900">
                {org.authorizedSignatoryTitle}
              </div>
              <div className="text-[11px] text-slate-500">{org.legalName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
