import type { ValidateOptions, ValidationResult } from '../types';
import { validateCIN, type CinOutcome } from './validateCIN';
import { validateLLPIN } from './validateLLPIN';

/**
 * NORMALISATION POLICY (documented in docs/design-decisions.md)
 *
 * Applied automatically, and always reported back to the user as a note:
 *   1. Leading/trailing whitespace (including non-breaking and other Unicode spaces) is trimmed.
 *   2. ASCII lowercase letters are converted to uppercase.
 *
 * NEVER applied automatically (the identifier is reported invalid, with a suggestion where one is obvious):
 *   - Internal spaces, missing or wrong hyphens, look-alike Unicode letters (e.g. Cyrillic "А"),
 *     fullwidth characters, zero-width characters, stray punctuation.
 */
export function normalizeIdentifier(raw: string): { normalized: string; notes: string[] } {
  const notes: string[] = [];
  let value = raw.trim();
  if (value !== raw) notes.push('Leading or trailing spaces were ignored.');

  const upper = value.replace(/[a-z]/g, (c) => c.toUpperCase());
  if (upper !== value) notes.push('Lowercase letters were treated as uppercase.');
  value = upper;

  return { normalized: value, notes };
}

/**
 * Decide which format the user was attempting. Only used to pick a validator and to give
 * relevant error messages; it never makes an identifier valid.
 *   - contains a hyphen (any dash-like character) or is 8 characters or shorter  -> LLPIN attempt
 *   - anything else                                                              -> CIN attempt
 */
export function detectKind(normalized: string): 'company' | 'llp' {
  return /[-\u2010-\u2015\u2212]/.test(normalized) || normalized.length <= 8 ? 'llp' : 'company';
}

/** Split pasted text into lines. Handles \n, \r\n and old-Mac \r. */
export function splitLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

/** Number of non-empty lines (what the input panel shows as the live count). */
export function countNonEmptyLines(text: string): number {
  return splitLines(text).filter((l) => l.trim() !== '').length;
}

/**
 * Validate a whole pasted block. Preserves input order, skips blank lines, keeps duplicates
 * (and marks them), and never throws on odd input.
 */
export function parseAndValidate(text: string, options: ValidateOptions = {}): ValidationResult[] {
  const results: ValidationResult[] = [];
  const firstSeen = new Map<string, number>(); // normalized value -> row of first occurrence

  splitLines(text).forEach((rawLine, index) => {
    if (rawLine.trim() === '') return;

    const row = results.length + 1;
    const { normalized, notes } = normalizeIdentifier(rawLine);
    const kind = detectKind(normalized);
    // LLPINs never decode into CIN segments, so their outcome simply has no `cin`.
    const outcome: CinOutcome =
      kind === 'llp' ? validateLLPIN(normalized) : validateCIN(normalized, options);

    const hasError = outcome.issues.some((i) => i.severity === 'error');
    const status = hasError ? 'invalid' : outcome.issues.length > 0 ? 'review' : 'valid';

    const result: ValidationResult = {
      row,
      line: index + 1,
      original: rawLine,
      normalized,
      kind,
      status,
      issues: outcome.issues,
      notes,
      suggestion: outcome.suggestion,
      duplicateCount: 1,
      cin: outcome.cin,
    };

    const earlier = firstSeen.get(normalized);
    if (earlier === undefined) {
      firstSeen.set(normalized, row);
    } else {
      result.duplicateOf = earlier;
      results[earlier - 1].duplicateCount += 1;
      result.duplicateCount = results[earlier - 1].duplicateCount;
    }
    results.push(result);
  });

  return results;
}
