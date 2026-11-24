import type { jsPDF } from 'jspdf';
import { resultToRow } from './exportData';
import type { ValidationResult } from '../types';

/**
 * jsPDF's built-in fonts only contain Latin-1 characters. Pasted identifiers can contain anything
 * (Cyrillic look-alikes, zero-width characters...), which would print as garbage. Such characters are shown
 * as <U+0410> so the report stays truthful and readable. Typographic punctuation is mapped to plain ASCII.
 */
export function pdfSafe(text: string): string {
  return Array.from(
    text
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"'),
  )
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      if (cp === 9 || cp === 10 || (cp >= 32 && cp <= 126) || (cp >= 160 && cp <= 255)) return ch;
      return `<U+${cp.toString(16).toUpperCase().padStart(4, '0')}>`;
    })
    .join('');
}

const STATUS_COLOURS: Record<ValidationResult['status'], [number, number, number]> = {
  valid: [20, 99, 58],
  invalid: [161, 37, 43],
  review: [122, 78, 0],
};

/** Builds the report. Separate from downloading so it can be tested without a browser. */
export async function buildPDF(
  results: ValidationResult[],
  generatedAt = new Date(),
  title = 'CIN & LLPIN Validation Report',
): Promise<jsPDF> {
  // Loaded on demand so the PDF library does not slow down the first page load.
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const margin = 36;
  const pageWidth = doc.internal.pageSize.getWidth();

  const count = (s: ValidationResult['status']) => results.filter((r) => r.status === s).length;
  const companies = results.filter((r) => r.kind === 'company').length;

  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(22, 27, 38);
  doc.text(title, margin, 44);
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(74, 82, 100);
  doc.text(`Generated ${generatedAt.toLocaleString('en-IN')}  |  FileSure CIN Checker (independent technical assignment by Yash Tripathi)`, margin, 60);

  doc.setFontSize(10).setTextColor(22, 27, 38);
  doc.text(
    `Total: ${results.length}   Valid: ${count('valid')}   Invalid: ${count('invalid')}   Needs review: ${count('review')}   Companies: ${companies}   LLPs: ${results.length - companies}`,
    margin, 80,
  );
  doc.setFontSize(8.5).setTextColor(74, 82, 100);
  const note = doc.splitTextToSize(
    'This report shows identifier format checks and decoded codes only. It does not verify company existence, registration status or compliance with the Ministry of Corporate Affairs.',
    pageWidth - margin * 2,
  );
  doc.text(note, margin, 94);

  const head = [['#', 'Identifier', 'Status', 'Type', 'Listing', 'State', 'Year', 'Company type', 'Industry', 'Reg. no.', 'Details']];
  const body = results.map((r) => {
    const c = resultToRow(r); // [row, id, status, entity, listing, state, year, type, industry, reg, details, dup]
    const details = r.duplicateOf ? `${c[10]} Duplicate of row ${r.duplicateOf}.` : c[10];
    return [c[0], c[1].trim(), c[2], c[3], c[4], c[5], c[6], c[7], c[8], c[9], details].map(pdfSafe);
  });

  autoTable(doc, {
    head,
    body,
    startY: 112,
    margin: { left: margin, right: margin, bottom: 40 },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 3, lineColor: [221, 225, 232], lineWidth: 0.5, textColor: [22, 27, 38], overflow: 'linebreak' },
    headStyles: { fillColor: [36, 71, 196], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 248, 250] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 110, font: 'courier', fontSize: 7 },
      2: { cellWidth: 48, fontStyle: 'bold' },
      3: { cellWidth: 40 },
      4: { cellWidth: 48 },
      5: { cellWidth: 62 },
      6: { cellWidth: 34 },
      7: { cellWidth: 70 },
      8: { cellWidth: 38 },
      9: { cellWidth: 44 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        data.cell.styles.textColor = STATUS_COLOURS[results[data.row.index].status];
      }
    },
  });

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8).setTextColor(110, 117, 133);
    doc.text(`Page ${p} of ${pages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
    doc.text('Format check only. Not verified against MCA records.', margin, doc.internal.pageSize.getHeight() - 20);
  }
  return doc;
}

export async function downloadPDF(
  results: ValidationResult[],
  filename = 'cin-llpin-report.pdf',
  title?: string,
): Promise<void> {
  const doc = await buildPDF(results, new Date(), title);
  doc.save(filename);
}
