/** Shared types for the validation engine and the UI. */

/**
 * - error:  the identifier is structurally wrong (length, characters, digits where letters belong...).
 * - review: the structure is fine but a code is not in our reference data (or is implausible).
 *           We cannot tell whether the identifier is wrong or our reference data is incomplete.
 */
export type IssueSeverity = 'error' | 'review';

export interface Issue {
  code: string;
  severity: IssueSeverity;
  message: string;
}

/** 'valid' = structure OK and every code recognised. 'review' = structure OK, some code unrecognised. */
export type ValidationStatus = 'valid' | 'invalid' | 'review';
export type EntityKind = 'company' | 'llp';

export interface DecodedSegment {
  key: 'listing' | 'industry' | 'state' | 'year' | 'type' | 'registration';
  label: string;
  /** 1-based character positions inside the CIN, e.g. "2–6". */
  positions: string;
  raw: string;
  /** Human meaning, or null when the code is not recognised. */
  meaning: string | null;
  note?: string;
}

export interface CinDecoded {
  listing: 'Listed' | 'Unlisted' | null;
  industryCode: string;
  stateCode: string;
  state: string | null;
  year: number | null;
  typeCode: string;
  companyType: string | null;
  registrationNumber: string;
  segments: DecodedSegment[];
}

export interface ValidationResult {
  /** 1-based position among non-empty lines (what the table shows). */
  row: number;
  /** 1-based line in the pasted text (blank lines count). */
  line: number;
  original: string;
  normalized: string;
  kind: EntityKind;
  status: ValidationStatus;
  issues: Issue[];
  /** Non-error information, e.g. "lowercase letters were converted". */
  notes: string[];
  /** A possible fix. Never applied automatically. */
  suggestion?: string;
  /** Row number of the first occurrence, when this is a repeat. */
  duplicateOf?: number;
  duplicateCount: number;
  cin?: CinDecoded;
}

export interface ValidateOptions {
  /** Injectable for tests. Defaults to the current year. */
  currentYear?: number;
}
