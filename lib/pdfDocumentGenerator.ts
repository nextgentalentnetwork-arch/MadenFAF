import {
  DonationRecordItem,
  MemberProfileRecord,
  OrganizationPaymentSettings,
  maskIndianMobile,
} from '@/lib/donatorsPortalService';

export type PdfDocumentMode = 'invoice' | 'receipt' | 'reversal';

/**
 * Escapes text for PDF literal strings in WinAnsiEncoding.
 * Replaces the Unicode Rupee sign (₹) with "INR " because standard PDF Type1 fonts
 * (Helvetica / Courier) use 1-byte WinAnsiEncoding.
 */
function escapePdfText(input: string): string {
  return String(input || '')
    .replace(/₹/g, 'INR ')
    .replace(/•/g, '-')
    .replace(/·/g, '|')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Splits a string into wrapped lines of roughly `maxChars` characters.
 */
function wrapText(text: string, maxChars: number): string[] {
  const cleaned = String(text || '')
    .replace(/₹/g, 'INR ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [''];
  const words = cleaned.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Low-level A4 PDF 1.4 Canvas Builder using standard Type1 fonts:
 * /F1 = Helvetica
 * /F2 = Helvetica-Bold
 * /F3 = Helvetica-Oblique
 * /F4 = Courier
 * /F5 = Courier-Bold
 */
class PdfPageCanvas {
  private ops: string[] = [];
  public readonly width = 595.28;
  public readonly height = 841.89;

  private toPdfY(topY: number): number {
    return Number((this.height - topY).toFixed(2));
  }

  public setFillRgb(r: number, g: number, b: number) {
    this.ops.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg`);
  }

  public setStrokeRgb(r: number, g: number, b: number) {
    this.ops.push(`${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG`);
  }

  public setLineWidth(w: number) {
    this.ops.push(`${w.toFixed(2)} w`);
  }

  public fillRect(x: number, topY: number, w: number, h: number) {
    const pdfY = this.toPdfY(topY + h);
    this.ops.push(`${x.toFixed(2)} ${pdfY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }

  public strokeRect(x: number, topY: number, w: number, h: number) {
    const pdfY = this.toPdfY(topY + h);
    this.ops.push(`${x.toFixed(2)} ${pdfY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
  }

  public fillAndStrokeRect(x: number, topY: number, w: number, h: number) {
    const pdfY = this.toPdfY(topY + h);
    this.ops.push(`${x.toFixed(2)} ${pdfY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re B`);
  }

  public drawLine(x1: number, topY1: number, x2: number, topY2: number) {
    const y1 = this.toPdfY(topY1);
    const y2 = this.toPdfY(topY2);
    this.ops.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  public drawText(
    text: string,
    x: number,
    topY: number,
    options?: {
      font?: 'F1' | 'F2' | 'F3' | 'F4' | 'F5';
      size?: number;
      color?: [number, number, number];
      align?: 'left' | 'right' | 'center';
    }
  ) {
    const font = options?.font || 'F1';
    const size = options?.size || 10;
    const color = options?.color || [15, 23, 42];
    const align = options?.align || 'left';
    const safe = escapePdfText(text);

    // Estimate width for right/center alignment
    const isMono = font === 'F4' || font === 'F5';
    const charFactor = isMono ? 0.6 : font === 'F2' ? 0.54 : 0.5;
    const estimatedWidth = safe.length * size * charFactor;

    let drawX = x;
    if (align === 'right') {
      drawX = x - estimatedWidth;
    } else if (align === 'center') {
      drawX = x - estimatedWidth / 2;
    }

    const pdfY = this.toPdfY(topY);
    this.setFillRgb(color[0], color[1], color[2]);
    this.ops.push(
      `BT /${font} ${size.toFixed(1)} Tf ${drawX.toFixed(2)} ${pdfY.toFixed(2)} Td (${safe}) Tj ET`
    );
  }

  public getContentStream(): string {
    return this.ops.join('\n');
  }
}

/**
 * Compiles one or more PdfPageCanvas instances into a valid PDF 1.4 Uint8Array binary.
 */
function compilePdfDocument(pages: PdfPageCanvas[], title: string): Uint8Array {
  const objects: string[] = [];
  const addObject = (body: string): number => {
    objects.push(body);
    return objects.length; // 1-based object ID
  };

  // Obj 1: Catalog (placeholder updated after pages tree)
  const catalogId = addObject('');
  // Obj 2: Pages root (placeholder updated after page objects)
  const pagesRootId = addObject('');

  // Standard Type1 Font Objects
  const fontHelveticaId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const fontHelveticaBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const fontHelveticaObliqueId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');
  const fontCourierId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
  const fontCourierBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>');

  const pageIds: number[] = [];

  for (const page of pages) {
    const streamData = page.getContentStream();
    const contentId = addObject(
      `<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream`
    );

    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${fontHelveticaId} 0 R /F2 ${fontHelveticaBoldId} 0 R /F3 ${fontHelveticaObliqueId} 0 R /F4 ${fontCourierId} 0 R /F5 ${fontCourierBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  // Info dictionary
  const infoId = addObject(
    `<< /Title (${escapePdfText(title)}) /Producer (MADEN FAF Donators Portal Document Engine) /Creator (MADEN Football Academy Foundation) >>`
  );

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesRootId} 0 R >>`;
  objects[pagesRootId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  // Assemble PDF file with exact byte offsets
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const encoder = new TextEncoder();
  return encoder.encode(pdf);
}

/**
 * Generates a print-ready A4 PDF Blob for a single Donation Invoice, Official Verified Receipt, or Reversal Note.
 */
export function generateDonationPdfBlob(
  donation: DonationRecordItem,
  settings: OrganizationPaymentSettings,
  requestedMode: PdfDocumentMode
): { blob: Blob; filename: string; effectiveMode: PdfDocumentMode; docNumber: string } {
  const org = settings.organizationDisplayDetails;

  const isReceiptAllowed =
    donation.paymentStatus === 'verified' ||
    (donation.paymentStatus === 'refunded' && Boolean(donation.receiptNumber));
  const isReversalAllowed =
    donation.paymentStatus === 'refunded' && Boolean(donation.reversalDocumentNumber);

  // Security guard: never issue an Official Receipt PDF for unverified contributions
  const effectiveMode: PdfDocumentMode =
    requestedMode === 'receipt' && !isReceiptAllowed
      ? 'invoice'
      : requestedMode === 'reversal' && !isReversalAllowed
      ? 'invoice'
      : requestedMode;

  const docNumber =
    effectiveMode === 'receipt'
      ? donation.receiptNumber || donation.invoiceNumber
      : effectiveMode === 'reversal'
      ? donation.reversalDocumentNumber || donation.invoiceNumber
      : donation.invoiceNumber;

  const docDateRaw =
    effectiveMode === 'receipt'
      ? donation.verifiedAt || donation.paymentDate || donation.updatedAt
      : effectiveMode === 'reversal'
      ? donation.reversedAt || donation.updatedAt
      : donation.createdAt;

  const formattedDate = new Date(docDateRaw).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const page = new PdfPageCanvas();
  const marginX = 38;
  const contentWidth = page.width - marginX * 2;

  // Outer Institutional Border
  page.setLineWidth(1);
  page.setStrokeRgb(203, 213, 225);
  page.strokeRect(24, 24, page.width - 48, page.height - 48);

  // Top Header Banner (Dark Slate with Gold Accent Bar)
  page.setFillRgb(15, 23, 42);
  page.fillRect(24, 24, page.width - 48, 86);
  page.setFillRgb(245, 158, 11);
  page.fillRect(24, 110, page.width - 48, 4);

  // Organization Name & Metadata in Top Banner
  page.drawText(org.legalName.toUpperCase(), marginX, 48, {
    font: 'F2',
    size: 13,
    color: [255, 255, 255],
  });
  page.drawText(org.registeredAddress, marginX, 64, {
    font: 'F1',
    size: 8.5,
    color: [203, 213, 225],
  });
  page.drawText(
    `Email: ${org.officialEmail}  |  Phone: ${org.officialPhone}  |  Web: ${org.website}`,
    marginX,
    78,
    { font: 'F1', size: 8, color: [148, 163, 184] }
  );
  if (org.registrationNumber) {
    page.drawText(
      `Reg. No: ${org.registrationNumber}${org.panNumber ? `  |  PAN: ${org.panNumber}` : ''}`,
      marginX,
      92,
      { font: 'F4', size: 8, color: [251, 191, 36] }
    );
  }

  // Right-side Document Classification in Banner
  const docTypeLabel =
    effectiveMode === 'receipt'
      ? 'OFFICIAL DONATION RECEIPT'
      : effectiveMode === 'reversal'
      ? 'REVERSAL / REFUND NOTE'
      : 'DONATION INVOICE';

  page.drawText(docTypeLabel, page.width - marginX, 48, {
    font: 'F2',
    size: 10,
    color: effectiveMode === 'receipt' ? [52, 211, 153] : effectiveMode === 'reversal' ? [251, 113, 133] : [251, 191, 36],
    align: 'right',
  });
  page.drawText(docNumber, page.width - marginX, 65, {
    font: 'F5',
    size: 11,
    color: [255, 255, 255],
    align: 'right',
  });
  page.drawText(`Issue Date: ${formattedDate}`, page.width - marginX, 80, {
    font: 'F1',
    size: 8.5,
    color: [203, 213, 225],
    align: 'right',
  });

  const statusBadgeText =
    effectiveMode === 'receipt' && donation.paymentStatus === 'verified'
      ? 'STATUS: VERIFIED & PAID'
      : effectiveMode === 'receipt' && donation.paymentStatus === 'refunded'
      ? 'STATUS: REVERSED (AUDIT COPY)'
      : effectiveMode === 'reversal'
      ? 'STATUS: REFUNDED / REVERSED'
      : `STATUS: ${donation.paymentStatus.replace(/_/g, ' ').toUpperCase()}`;

  page.drawText(statusBadgeText, page.width - marginX, 94, {
    font: 'F2',
    size: 8,
    color:
      effectiveMode === 'receipt' && donation.paymentStatus === 'verified'
        ? [110, 231, 183]
        : [253, 224, 71],
    align: 'right',
  });

  // Legal Notice / Verification Callout Banner (topY = 128)
  let cursorY = 128;
  page.setLineWidth(0.75);
  if (effectiveMode === 'invoice') {
    page.setFillRgb(255, 251, 235);
    page.setStrokeRgb(253, 230, 138);
    page.fillAndStrokeRect(marginX, cursorY, contentWidth, 48);
    page.drawText(
      'IMPORTANT NOTICE: PAYMENT INSTRUCTION / DONATION INVOICE ONLY (NOT A RECEIPT)',
      marginX + 12,
      cursorY + 15,
      { font: 'F2', size: 8.5, color: [146, 64, 14] }
    );
    page.drawText(
      `This document (${donation.invoiceNumber}) is a scheduled contribution invoice and payment instruction. It is NOT proof`,
      marginX + 12,
      cursorY + 28,
      { font: 'F1', size: 8, color: [180, 83, 9] }
    );
    page.drawText(
      'that funds have been received. Official receipts are issued strictly after administrative verification of your UPI transfer.',
      marginX + 12,
      cursorY + 39,
      { font: 'F1', size: 8, color: [180, 83, 9] }
    );
    cursorY += 62;
  } else if (effectiveMode === 'receipt' && donation.paymentStatus === 'verified') {
    page.setFillRgb(236, 253, 245);
    page.setStrokeRgb(167, 243, 208);
    page.fillAndStrokeRect(marginX, cursorY, contentWidth, 44);
    page.drawText(
      'OFFICIAL VERIFIED CONTRIBUTION RECEIPT — PAYMENT CONFIRMED BY ADMINISTRATION',
      marginX + 12,
      cursorY + 16,
      { font: 'F2', size: 8.5, color: [6, 95, 70] }
    );
    page.drawText(
      `We gratefully acknowledge receipt of INR ${donation.amount.toLocaleString('en-IN')}.00 against Donation Reference ${donation.donationId} (Invoice ${donation.invoiceNumber}).`,
      marginX + 12,
      cursorY + 31,
      { font: 'F1', size: 8, color: [4, 120, 87] }
    );
    cursorY += 58;
  } else {
    page.setFillRgb(255, 241, 242);
    page.setStrokeRgb(254, 205, 211);
    page.fillAndStrokeRect(marginX, cursorY, contentWidth, 48);
    page.drawText(
      `OFFICIAL REVERSAL / REFUND AUDIT NOTICE (${donation.reversalDocumentNumber || 'REVERSED'})`,
      marginX + 12,
      cursorY + 15,
      { font: 'F2', size: 8.5, color: [159, 18, 57] }
    );
    page.drawText(
      `Original Receipt: ${donation.receiptNumber || 'N/A'}  |  Original Invoice: ${donation.invoiceNumber}`,
      marginX + 12,
      cursorY + 28,
      { font: 'F4', size: 8, color: [190, 18, 60] }
    );
    page.drawText(
      `Reason: ${donation.reversalReason || 'Administrative reversal recorded'}`,
      marginX + 12,
      cursorY + 39,
      { font: 'F1', size: 8, color: [190, 18, 60] }
    );
    cursorY += 62;
  }

  // Two-Column Donor & Transaction Metadata Grid
  const boxHeight = 128;
  const colWidth = (contentWidth - 14) / 2;

  // Left Box: Donor & Member Profile
  page.setFillRgb(248, 250, 252);
  page.setStrokeRgb(226, 232, 240);
  page.fillAndStrokeRect(marginX, cursorY, colWidth, boxHeight);

  page.drawText('DONOR & MEMBER DETAILS', marginX + 12, cursorY + 16, {
    font: 'F2',
    size: 8,
    color: [100, 116, 139],
  });
  page.drawText(donation.donorName, marginX + 12, cursorY + 32, {
    font: 'F2',
    size: 11,
    color: [15, 23, 42],
  });
  page.drawText(`Member ID: ${donation.memberId}`, marginX + 12, cursorY + 47, {
    font: 'F5',
    size: 9,
    color: [15, 23, 42],
  });

  const addrLines = wrapText(`Address: ${donation.donorAddress || 'On File'}`, 42).slice(0, 2);
  addrLines.forEach((line, idx) => {
    page.drawText(line, marginX + 12, cursorY + 62 + idx * 11, {
      font: 'F1',
      size: 8,
      color: [71, 85, 105],
    });
  });

  page.drawText(
    `Mobile: ${maskIndianMobile(donation.donorMobile)} (${donation.mobileVerificationStatus.replace(/_/g, ' ')})`,
    marginX + 12,
    cursorY + 90,
    { font: 'F4', size: 8, color: [51, 65, 85] }
  );
  page.drawText(`Email: ${donation.donorEmail}`, marginX + 12, cursorY + 104, {
    font: 'F1',
    size: 8,
    color: [71, 85, 105],
  });

  // Right Box: Contribution & Verification Metadata
  const rightBoxX = marginX + colWidth + 14;
  page.setFillRgb(248, 250, 252);
  page.setStrokeRgb(226, 232, 240);
  page.fillAndStrokeRect(rightBoxX, cursorY, colWidth, boxHeight);

  page.drawText('CONTRIBUTION & VERIFICATION METADATA', rightBoxX + 12, cursorY + 16, {
    font: 'F2',
    size: 8,
    color: [100, 116, 139],
  });

  const metaRows: Array<[string, string]> = [
    ['Donation Reference:', donation.donationId],
    ['Invoice Number:', donation.invoiceNumber],
    ['Official Receipt No:', donation.receiptNumber || 'Pending Verification'],
    ['Contribution Plan:', `${donation.frequency.toUpperCase()} Commitment`],
    ['Payment Method:', 'Official MADEN FAF QR / UPI'],
    ['UTR / UPI Ref:', donation.transactionReference || 'Not Submitted'],
  ];

  metaRows.forEach(([label, val], idx) => {
    const rowY = cursorY + 32 + idx * 15;
    page.drawText(label, rightBoxX + 12, rowY, {
      font: 'F1',
      size: 8,
      color: [100, 116, 139],
    });
    page.drawText(val, rightBoxX + colWidth - 12, rowY, {
      font: 'F5',
      size: 8,
      color: [15, 23, 42],
      align: 'right',
    });
  });

  cursorY += boxHeight + 18;

  // Financial Line-Item Table
  const tableHeaderH = 26;
  const tableRowH = 48;
  const tableFooterH = 30;

  // Table Header
  page.setFillRgb(15, 23, 42);
  page.fillRect(marginX, cursorY, contentWidth, tableHeaderH);
  page.drawText('CONTRIBUTION DESCRIPTION & PURPOSE', marginX + 12, cursorY + 16, {
    font: 'F2',
    size: 8.5,
    color: [255, 255, 255],
  });
  page.drawText('FREQUENCY', marginX + 330, cursorY + 16, {
    font: 'F2',
    size: 8.5,
    color: [255, 255, 255],
  });
  page.drawText('AMOUNT (INR)', marginX + contentWidth - 12, cursorY + 16, {
    font: 'F2',
    size: 8.5,
    color: [255, 255, 255],
    align: 'right',
  });

  cursorY += tableHeaderH;

  // Table Body Row
  page.setFillRgb(255, 255, 255);
  page.setStrokeRgb(203, 213, 225);
  page.fillAndStrokeRect(marginX, cursorY, contentWidth, tableRowH);

  page.drawText(
    'Foundation Grassroots & Youth Football Development Contribution',
    marginX + 12,
    cursorY + 18,
    { font: 'F2', size: 9.5, color: [15, 23, 42] }
  );
  const purposeLines = wrapText(
    `Purpose: ${donation.purpose || 'General Foundation Support'}`,
    58
  );
  page.drawText(purposeLines[0] || '', marginX + 12, cursorY + 33, {
    font: 'F1',
    size: 8.5,
    color: [71, 85, 105],
  });

  page.drawText(
    `${donation.frequency.charAt(0).toUpperCase() + donation.frequency.slice(1)} Plan`,
    marginX + 330,
    cursorY + 25,
    { font: 'F1', size: 9, color: [51, 65, 85] }
  );

  page.drawText(
    `INR ${donation.amount.toLocaleString('en-IN')}.00`,
    marginX + contentWidth - 12,
    cursorY + 26,
    { font: 'F5', size: 10.5, color: [15, 23, 42], align: 'right' }
  );

  cursorY += tableRowH;

  // Table Footer Row
  page.setFillRgb(241, 245, 249);
  page.setStrokeRgb(203, 213, 225);
  page.fillAndStrokeRect(marginX, cursorY, contentWidth, tableFooterH);

  const totalLabel =
    effectiveMode === 'receipt'
      ? 'TOTAL VERIFIED CONTRIBUTION RECEIVED'
      : effectiveMode === 'reversal'
      ? 'TOTAL CONTRIBUTION AMOUNT REVERSED / REFUNDED'
      : 'TOTAL CONTRIBUTION AMOUNT DUE';

  page.drawText(totalLabel, marginX + 12, cursorY + 19, {
    font: 'F2',
    size: 9,
    color: [15, 23, 42],
  });
  page.drawText(
    `INR ${donation.amount.toLocaleString('en-IN')}.00`,
    marginX + contentWidth - 12,
    cursorY + 19,
    { font: 'F5', size: 11.5, color: [15, 23, 42], align: 'right' }
  );

  cursorY += tableFooterH + 14;

  // Amount in Words Box
  page.setFillRgb(248, 250, 252);
  page.setStrokeRgb(226, 232, 240);
  page.fillAndStrokeRect(marginX, cursorY, contentWidth, 30);
  page.drawText(`Amount in Words: ${donation.amountInWords}`, marginX + 12, cursorY + 19, {
    font: 'F2',
    size: 8.5,
    color: [15, 23, 42],
  });
  page.drawText(`Currency: ${donation.currency || 'INR'}`, marginX + contentWidth - 12, cursorY + 19, {
    font: 'F4',
    size: 8,
    color: [100, 116, 139],
    align: 'right',
  });

  cursorY += 46;

  // Payment Instructions (for Invoice) OR Official Verification Audit Block (for Receipt)
  if (effectiveMode === 'invoice') {
    page.setFillRgb(255, 255, 255);
    page.setStrokeRgb(226, 232, 240);
    page.fillAndStrokeRect(marginX, cursorY, contentWidth, 82);
    page.drawText('OFFICIAL QR / UPI PAYMENT INSTRUCTIONS', marginX + 12, cursorY + 16, {
      font: 'F2',
      size: 8.5,
      color: [15, 23, 42],
    });
    settings.paymentInstructions.slice(0, 4).forEach((inst, idx) => {
      const wrapped = wrapText(`${idx + 1}. ${inst}`, 88);
      page.drawText(wrapped[0] || '', marginX + 12, cursorY + 32 + idx * 12, {
        font: 'F1',
        size: 8,
        color: [71, 85, 105],
      });
    });
    cursorY += 98;
  } else {
    page.setFillRgb(248, 250, 252);
    page.setStrokeRgb(203, 213, 225);
    page.fillAndStrokeRect(marginX, cursorY, contentWidth, 72);
    page.drawText('ADMINISTRATIVE VERIFICATION & AUDIT TRAIL', marginX + 12, cursorY + 16, {
      font: 'F2',
      size: 8.5,
      color: [15, 23, 42],
    });
    page.drawText(
      `Verified By: ${donation.verifiedBy || 'MADEN FAF Administration'}   |   Verified Timestamp: ${
        donation.verifiedAt ? new Date(donation.verifiedAt).toLocaleString('en-IN') : formattedDate
      }`,
      marginX + 12,
      cursorY + 32,
      { font: 'F4', size: 8, color: [51, 65, 85] }
    );
    page.drawText(
      `Bank / UPI UTR Reference: ${donation.transactionReference || 'Verified on File'}   |   Payment Date: ${
        donation.paymentDate || formattedDate
      }`,
      marginX + 12,
      cursorY + 46,
      { font: 'F4', size: 8, color: [51, 65, 85] }
    );
    page.drawText(
      'Digital Verification Seal: Authentic record verified against MADEN FAF Central Donation Ledger.',
      marginX + 12,
      cursorY + 60,
      { font: 'F3', size: 8, color: [4, 120, 87] }
    );
    cursorY += 88;
  }

  // Tax Exemption & Signatory Block near bottom
  const footerTopY = Math.max(cursorY + 10, 680);
  page.setLineWidth(0.75);
  page.setStrokeRgb(226, 232, 240);
  page.drawLine(marginX, footerTopY, page.width - marginX, footerTopY);

  if (org.tax80gVerified && org.tax80gRegistrationNumber) {
    page.drawText(
      `Section 80G Tax Exemption Reg. No: ${org.tax80gRegistrationNumber}`,
      marginX,
      footerTopY + 18,
      { font: 'F2', size: 8.5, color: [6, 95, 70] }
    );
  } else {
    const taxNoteLines = wrapText(
      `Compliance Note: Contributions support grassroots youth football training, player welfare, and scholarship programs at ${org.legalName}. Tax-deduction status under Section 80G is applicable only when explicitly stated with a verified 80G registration number.`,
      62
    );
    taxNoteLines.slice(0, 3).forEach((line, idx) => {
      page.drawText(line, marginX, footerTopY + 18 + idx * 11, {
        font: 'F1',
        size: 7.5,
        color: [100, 116, 139],
      });
    });
  }

  // Authorized Signatory on Right
  page.drawLine(page.width - marginX - 165, footerTopY + 34, page.width - marginX, footerTopY + 34);
  page.drawText(org.authorizedSignatoryName, page.width - marginX, footerTopY + 28, {
    font: 'F3',
    size: 10,
    color: [15, 23, 42],
    align: 'right',
  });
  page.drawText(org.authorizedSignatoryTitle, page.width - marginX, footerTopY + 46, {
    font: 'F2',
    size: 8.5,
    color: [15, 23, 42],
    align: 'right',
  });
  page.drawText(`For ${org.legalName}`, page.width - marginX, footerTopY + 58, {
    font: 'F1',
    size: 8,
    color: [100, 116, 139],
    align: 'right',
  });

  // Bottom System Footer Bar
  page.drawText(
    `System Generated Document  |  Doc Ref: ${docNumber}  |  Member ID: ${donation.memberId}  |  ${org.website}`,
    page.width / 2,
    804,
    { font: 'F4', size: 7.5, color: [148, 163, 184], align: 'center' }
  );

  const pdfBytes = compilePdfDocument([page], `${docNumber} - ${org.legalName}`);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const filename = `${docNumber}.pdf`;

  return { blob, filename, effectiveMode, docNumber };
}

/**
 * Triggers a direct browser download of a single Donation Invoice, Official Verified Receipt, or Reversal Note as a `.pdf` file.
 */
export function downloadDonationPdf(
  donation: DonationRecordItem,
  settings: OrganizationPaymentSettings,
  mode: PdfDocumentMode
): void {
  if (typeof window === 'undefined') return;
  const { blob, filename } = generateDonationPdfBlob(donation, settings, mode);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Generates and downloads a Consolidated Verified Contribution Statement PDF
 * listing all verified donations for a Member (useful for annual accounting / tax records).
 */
export function downloadAnnualVerifiedStatementPdf(
  member: MemberProfileRecord,
  donations: DonationRecordItem[],
  settings: OrganizationPaymentSettings
): void {
  if (typeof window === 'undefined') return;
  const org = settings.organizationDisplayDetails;
  const verifiedList = donations.filter((d) => d.paymentStatus === 'verified');

  const page = new PdfPageCanvas();
  const marginX = 38;
  const contentWidth = page.width - marginX * 2;
  const statementNo = `MADEN-STMT-${new Date().getFullYear()}-${member.memberId.split('-').pop() || '001'}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Outer Border & Header Banner
  page.setLineWidth(1);
  page.setStrokeRgb(203, 213, 225);
  page.strokeRect(24, 24, page.width - 48, page.height - 48);

  page.setFillRgb(15, 23, 42);
  page.fillRect(24, 24, page.width - 48, 82);
  page.setFillRgb(16, 185, 129);
  page.fillRect(24, 106, page.width - 48, 4);

  page.drawText(org.legalName.toUpperCase(), marginX, 48, {
    font: 'F2',
    size: 13,
    color: [255, 255, 255],
  });
  page.drawText(org.registeredAddress, marginX, 64, {
    font: 'F1',
    size: 8.5,
    color: [203, 213, 225],
  });
  page.drawText(
    `Email: ${org.officialEmail}  |  Phone: ${org.officialPhone}  |  Web: ${org.website}`,
    marginX,
    78,
    { font: 'F1', size: 8, color: [148, 163, 184] }
  );

  page.drawText('CONSOLIDATED VERIFIED STATEMENT', page.width - marginX, 48, {
    font: 'F2',
    size: 9.5,
    color: [52, 211, 153],
    align: 'right',
  });
  page.drawText(statementNo, page.width - marginX, 64, {
    font: 'F5',
    size: 10.5,
    color: [255, 255, 255],
    align: 'right',
  });
  page.drawText(`Generated: ${issueDate}`, page.width - marginX, 78, {
    font: 'F1',
    size: 8.5,
    color: [203, 213, 225],
    align: 'right',
  });

  // Member Summary Box
  let cursorY = 124;
  const totalVerifiedAmount = verifiedList.reduce((acc, d) => acc + d.amount, 0);

  page.setFillRgb(248, 250, 252);
  page.setStrokeRgb(226, 232, 240);
  page.fillAndStrokeRect(marginX, cursorY, contentWidth, 68);

  page.drawText(`Donor Name: ${member.fullName}`, marginX + 12, cursorY + 18, {
    font: 'F2',
    size: 10,
    color: [15, 23, 42],
  });
  page.drawText(`Member ID: ${member.memberId}`, marginX + 12, cursorY + 34, {
    font: 'F5',
    size: 9,
    color: [51, 65, 85],
  });
  page.drawText(
    `Registered Mobile: ${maskIndianMobile(member.primaryMobile)}  |  Email: ${member.email}`,
    marginX + 12,
    cursorY + 50,
    { font: 'F1', size: 8.5, color: [71, 85, 105] }
  );

  page.drawText('TOTAL VERIFIED CONTRIBUTIONS', page.width - marginX - 12, cursorY + 20, {
    font: 'F2',
    size: 8,
    color: [4, 120, 87],
    align: 'right',
  });
  page.drawText(
    `INR ${totalVerifiedAmount.toLocaleString('en-IN')}.00`,
    page.width - marginX - 12,
    cursorY + 38,
    { font: 'F5', size: 13, color: [6, 95, 70], align: 'right' }
  );
  page.drawText(
    `${verifiedList.length} Verified Contribution(s)`,
    page.width - marginX - 12,
    cursorY + 52,
    { font: 'F1', size: 8, color: [100, 116, 139], align: 'right' }
  );

  cursorY += 84;

  // Table Header
  page.setFillRgb(15, 23, 42);
  page.fillRect(marginX, cursorY, contentWidth, 24);
  page.drawText('DATE', marginX + 10, cursorY + 15, { font: 'F2', size: 8, color: [255, 255, 255] });
  page.drawText('RECEIPT NO', marginX + 80, cursorY + 15, { font: 'F2', size: 8, color: [255, 255, 255] });
  page.drawText('DONATION REF', marginX + 195, cursorY + 15, { font: 'F2', size: 8, color: [255, 255, 255] });
  page.drawText('UTR / UPI REF', marginX + 310, cursorY + 15, { font: 'F2', size: 8, color: [255, 255, 255] });
  page.drawText('AMOUNT (INR)', marginX + contentWidth - 10, cursorY + 15, {
    font: 'F2',
    size: 8,
    color: [255, 255, 255],
    align: 'right',
  });

  cursorY += 24;

  const maxRows = Math.min(verifiedList.length, 16);
  if (maxRows === 0) {
    page.setFillRgb(255, 255, 255);
    page.setStrokeRgb(226, 232, 240);
    page.fillAndStrokeRect(marginX, cursorY, contentWidth, 36);
    page.drawText(
      'No verified contributions recorded yet. Pending or unverified submissions are excluded.',
      marginX + 12,
      cursorY + 22,
      { font: 'F3', size: 8.5, color: [100, 116, 139] }
    );
    cursorY += 36;
  } else {
    for (let i = 0; i < maxRows; i++) {
      const item = verifiedList[i];
      const rowH = 24;
      page.setFillRgb(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      page.setStrokeRgb(226, 232, 240);
      page.fillAndStrokeRect(marginX, cursorY, contentWidth, rowH);

      const dStr = new Date(item.verifiedAt || item.paymentDate || item.createdAt).toLocaleDateString(
        'en-IN',
        { day: '2-digit', month: 'short', year: 'numeric' }
      );
      page.drawText(dStr, marginX + 10, cursorY + 15, { font: 'F4', size: 8, color: [51, 65, 85] });
      page.drawText(item.receiptNumber || 'VERIFIED', marginX + 80, cursorY + 15, {
        font: 'F5',
        size: 8,
        color: [6, 95, 70],
      });
      page.drawText(item.donationId, marginX + 195, cursorY + 15, {
        font: 'F4',
        size: 8,
        color: [15, 23, 42],
      });
      page.drawText(item.transactionReference || '-', marginX + 310, cursorY + 15, {
        font: 'F4',
        size: 8,
        color: [71, 85, 105],
      });
      page.drawText(
        `INR ${item.amount.toLocaleString('en-IN')}.00`,
        marginX + contentWidth - 10,
        cursorY + 15,
        { font: 'F5', size: 8.5, color: [15, 23, 42], align: 'right' }
      );
      cursorY += rowH;
    }
  }

  // Total Footer Row
  page.setFillRgb(236, 253, 245);
  page.setStrokeRgb(167, 243, 208);
  page.fillAndStrokeRect(marginX, cursorY, contentWidth, 28);
  page.drawText(
    'TOTAL VERIFIED CONTRIBUTIONS RECEIVED',
    marginX + 10,
    cursorY + 18,
    { font: 'F2', size: 9, color: [6, 95, 70] }
  );
  page.drawText(
    `INR ${totalVerifiedAmount.toLocaleString('en-IN')}.00`,
    marginX + contentWidth - 10,
    cursorY + 18,
    { font: 'F5', size: 10.5, color: [6, 95, 70], align: 'right' }
  );

  // Signatory Footer
  const footerTopY = 700;
  page.drawLine(page.width - marginX - 165, footerTopY + 34, page.width - marginX, footerTopY + 34);
  page.drawText(org.authorizedSignatoryName, page.width - marginX, footerTopY + 28, {
    font: 'F3',
    size: 10,
    color: [15, 23, 42],
    align: 'right',
  });
  page.drawText(org.authorizedSignatoryTitle, page.width - marginX, footerTopY + 46, {
    font: 'F2',
    size: 8.5,
    color: [15, 23, 42],
    align: 'right',
  });
  page.drawText(`For ${org.legalName}`, page.width - marginX, footerTopY + 58, {
    font: 'F1',
    size: 8,
    color: [100, 116, 139],
    align: 'right',
  });

  page.drawText(
    `Consolidated Verified Statement  |  Statement No: ${statementNo}  |  Member ID: ${member.memberId}`,
    page.width / 2,
    804,
    { font: 'F4', size: 7.5, color: [148, 163, 184], align: 'center' }
  );

  const pdfBytes = compilePdfDocument([page], `${statementNo} - ${org.legalName}`);
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${statementNo}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Prints the rendered HTML document inside an isolated hidden iframe so A4 printing
 * works cleanly inside iframe-hosted environments without printing surrounding UI.
 */
export function printElementInIsolatedIframe(elementId: string, documentTitle: string): void {
  if (typeof window === 'undefined') return;
  const target = document.getElementById(elementId);
  if (!target) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${documentTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <div style="max-width: 780px; margin: 0 auto; padding: 16px;">
    ${target.innerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`);
  doc.close();

  setTimeout(() => {
    try {
      document.body.removeChild(iframe);
    } catch {
      // ignore if already removed
    }
  }, 8000);
}
