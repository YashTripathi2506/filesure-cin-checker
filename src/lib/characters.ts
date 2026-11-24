import type { Issue } from '../types';

/** "А (U+0410)" – shows the character and its code point so look-alikes are identifiable. */
function describeChar(ch: string): string {
  const cp = ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0');
  return `"${ch}" (U+${cp})`;
}

function summarise(chars: string[]): string {
  const unique = [...new Set(chars)];
  const shown = unique.slice(0, 3).map(describeChar).join(', ');
  return unique.length > 3 ? `${shown} and ${unique.length - 3} more` : shown;
}

export interface CharacterReport {
  issues: Issue[];
  /** True if any character-level problem exists. Positional checks are unreliable then. */
  hasProblems: boolean;
  hasInternalSpace: boolean;
}

/**
 * Checks characters before any structural check, so users get one clear message
 * ("contains a Cyrillic letter") instead of a confusing cascade of segment errors.
 *
 * allowed: the extra ASCII punctuation permitted for this identifier type
 *          (LLPIN allows "-", CIN allows nothing).
 */
export function analyseCharacters(value: string, allowed: string): CharacterReport {
  const issues: Issue[] = [];
  const chars = Array.from(value);

  const spaces = chars.filter((c) => /\s/.test(c));
  if (spaces.length > 0) {
    issues.push({
      code: 'INTERNAL_SPACE',
      severity: 'error',
      message: 'The identifier contains spaces or other whitespace inside it. Identifiers cannot contain spaces.',
    });
  }

  const nonAscii = chars.filter((c) => c.charCodeAt(0) > 127 && !/\s/.test(c));
  if (nonAscii.length > 0) {
    issues.push({
      code: 'NON_ASCII',
      severity: 'error',
      message: `The identifier contains characters outside the basic Latin alphabet: ${summarise(nonAscii)}. These can look like normal letters or hyphens but are different characters.`,
    });
  }

  const special = chars.filter(
    (c) => c.charCodeAt(0) <= 127 && !/\s/.test(c) && !/[A-Z0-9]/.test(c) && !allowed.includes(c),
  );
  if (special.length > 0) {
    issues.push({
      code: 'SPECIAL_CHARACTERS',
      severity: 'error',
      message: `The identifier contains unexpected special characters: ${summarise(special)}.`,
    });
  }

  return { issues, hasProblems: issues.length > 0, hasInternalSpace: spaces.length > 0 };
}

/** Length in characters (code points), not UTF-16 units, so emoji count as one. */
export function charLength(value: string): number {
  return Array.from(value).length;
}
