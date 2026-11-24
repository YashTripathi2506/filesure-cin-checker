import type { Issue } from '../types';
import { analyseCharacters, charLength } from './characters';

export interface LlpOutcome {
  issues: Issue[];
  suggestion?: string;
}

/**
 * LLPIN = three letters, a hyphen, four digits (e.g. AAA-1234). 7 characters in total.
 * Supported by the MCA-style format described in published guides and by real LLPINs seen in public
 * registry listings (see docs/research.md). The prefix is allotted sequentially, so it carries no meaning.
 */
export const LLPIN_SHAPE = /^[A-Z]{3}-\d{4}$/;

/** Dash-like characters people paste from Word, PDFs and websites. Offered as a suggestion only. */
const DASH_LOOKALIKES = /[\u2010-\u2015\u2212]/g;

export function validateLLPIN(value: string): LlpOutcome {
  const issues: Issue[] = [];
  const length = charLength(value);
  const chars = analyseCharacters(value, '-');
  issues.push(...chars.issues);

  if (LLPIN_SHAPE.test(value)) return { issues };

  let suggestion: string | undefined;

  // Case 1: pasted with a typographic dash. Suggest, never auto-fix.
  const dashFixed = value.replace(DASH_LOOKALIKES, '-');
  if (dashFixed !== value && LLPIN_SHAPE.test(dashFixed)) suggestion = dashFixed;

  // Case 2: hyphen missing (AAA1234).
  if (/^[A-Z]{3}\d{4}$/.test(value)) {
    suggestion = `${value.slice(0, 3)}-${value.slice(3)}`;
    issues.push({
      code: 'LLPIN_MISSING_HYPHEN',
      severity: 'error',
      message: 'The LLPIN is missing the hyphen between the three letters and the four digits.',
    });
    return { issues, suggestion };
  }

  // Case 3: spaces around/inside the hyphen only (AAA - 1234).
  if (chars.hasInternalSpace) {
    const compact = value.replace(/\s+/g, '');
    if (LLPIN_SHAPE.test(compact)) suggestion = compact;
  }

  // Characters were the problem; don't pile positional errors on top of them.
  if (chars.hasProblems) {
    issues.push(formatIssue());
    return { issues, suggestion };
  }

  if (length !== 7) {
    issues.push({
      code: 'LLPIN_LENGTH',
      severity: 'error',
      message: `An LLPIN must contain exactly 7 characters (three letters, a hyphen, four digits). This input contains ${length}.`,
    });
  }

  const hyphenCount = (value.match(/-/g) ?? []).length;
  if (hyphenCount === 1) {
    const [prefix, digits] = value.split('-');
    if (!/^[A-Z]{3}$/.test(prefix)) {
      issues.push({
        code: 'LLPIN_PREFIX',
        severity: 'error',
        message: `The part before the hyphen must be exactly three letters. Found "${prefix}".`,
      });
    }
    if (!/^\d{4}$/.test(digits)) {
      issues.push({
        code: 'LLPIN_DIGITS',
        severity: 'error',
        message: `The part after the hyphen must be exactly four digits. Found "${digits}".`,
      });
    }
  } else if (hyphenCount > 1) {
    issues.push({
      code: 'LLPIN_HYPHENS',
      severity: 'error',
      message: `An LLPIN has exactly one hyphen. This input has ${hyphenCount}.`,
    });
  }

  issues.push(formatIssue(length));
  return { issues, suggestion };
}

function formatIssue(length?: number): Issue {
  // Long hyphenated text is most likely a CIN pasted with separators.
  const cinHint =
    length !== undefined && length >= 18 && length <= 24
      ? ' If this is a CIN, it has 21 letters and digits with no hyphens.'
      : '';
  return {
    code: 'LLPIN_FORMAT',
    severity: 'error',
    message: `The LLPIN does not match the supported identifier format (three letters, a hyphen, four digits, e.g. AAA-1234).${cinHint}`,
  };
}
