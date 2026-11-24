import type { ValidationResult } from '../types';

export const EXPORT_HEADERS = [
  'Row',
  'Identifier',
  'Status',
  'Entity type',
  'Listing status',
  'State',
  'Incorporation year',
  'Company type',
  'Industry code',
  'Registration number',
  'Details',
  'Duplicate of row',
];

/**
 * Spreadsheet formula injection (applies to copied/pasted tables): Excel/Sheets/LibreOffice run a cell as a formula if it starts with
 * = + - @ (or a tab / carriage return). User-pasted text is untrusted, so such cells get a leading
 * apostrophe, which makes the spreadsheet treat them as plain text (OWASP "CSV Injection").
 */
export function neutraliseFormula(cell: string): string {
  return /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell;
}

function statusLabel(r: ValidationResult): string {
  return r.status === 'valid' ? 'Valid' : r.status === 'review' ? 'Needs review' : 'Invalid';
}

function details(r: ValidationResult): string {
  if (r.issues.length > 0) {
    const text = r.issues.map((i) => i.message).join(' ');
    return r.suggestion ? `${text} Suggestion: ${r.suggestion}` : text;
  }
  return r.kind === 'llp'
    ? 'Format is valid. State, year and listing status are not encoded in an LLPIN.'
    : 'Format is valid. Not checked against MCA records.';
}

export function resultToRow(r: ValidationResult): string[] {
  const c = r.cin;
  const isLlp = r.kind === 'llp';
  return [
    String(r.row),
    r.original,
    statusLabel(r),
    isLlp ? 'LLP' : 'Company',
    isLlp ? 'Not encoded in LLPIN' : (c?.listing ?? ''),
    isLlp ? 'Not encoded in LLPIN' : (c ? (c.state ?? `Unrecognised (${c.stateCode})`) : ''),
    isLlp ? 'Not encoded in LLPIN' : (c?.year != null ? String(c.year) : ''),
    isLlp ? 'Not applicable' : (c ? (c.companyType ?? `Unrecognised (${c.typeCode})`) : ''),
    c?.industryCode ?? '',
    c?.registrationNumber ?? '',
    details(r),
    r.duplicateOf ? String(r.duplicateOf) : '',
  ];
}

/** Tab-separated text for pasting straight into Excel or Google Sheets. */
export function toTSV(results: ValidationResult[]): string {
  const clean = (s: string) => neutraliseFormula(s).replace(/[\t\r\n]+/g, ' ');
  return [EXPORT_HEADERS, ...results.map(resultToRow)].map((row) => row.map(clean).join('\t')).join('\n');
}

/** Invalid identifiers as they were entered, one per line. */
export function invalidIdentifiersText(results: ValidationResult[]): string {
  return results.filter((r) => r.status === 'invalid').map((r) => r.original.trim()).join('\n');
}

/** Triggers a browser download of a text file. */
export function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
