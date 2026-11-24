import { COMPANY_TYPES } from '../data/companyTypes';
import { STATE_CODES } from '../data/stateCodes';
import type { CinDecoded, DecodedSegment, Issue, ValidateOptions } from '../types';
import { analyseCharacters, charLength } from './characters';

export interface CinOutcome {
  issues: Issue[];
  suggestion?: string;
  cin?: CinDecoded;
}

/**
 * Full CIN shape, used only as a fast "is this perfectly formed" check and for suggestions.
 *   1 char  [LU]        listing status
 *   5 digits            industry code
 *   2 letters           state / UT code
 *   4 digits            year of incorporation
 *   3 letters           company type code
 *   6 digits            registration number
 */
export const CIN_SHAPE = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;

/**
 * The first Indian company law (the Companies Act, 1850) predates any company registered in India.
 * A year earlier than this is well-formed but implausible, so it is flagged for review, not rejected.
 * This is a reasoned lower bound, NOT an MCA rule (see docs/research.md).
 */
export const EARLIEST_PLAUSIBLE_YEAR = 1850;

/** Validates one already-normalised string as a CIN. Collects every problem, not just the first. */
export function validateCIN(value: string, options: ValidateOptions = {}): CinOutcome {
  const currentYear = options.currentYear ?? new Date().getFullYear();
  const issues: Issue[] = [];
  const length = charLength(value);

  const chars = analyseCharacters(value, '');
  issues.push(...chars.issues);

  if (length !== 21) {
    issues.push({
      code: 'CIN_LENGTH',
      severity: 'error',
      message: `A CIN must contain exactly 21 characters. This input contains ${length}.`,
    });
  }

  // Suggestion only: removing internal spaces would give a well-formed CIN.
  let suggestion: string | undefined;
  if (chars.hasInternalSpace) {
    const compact = value.replace(/\s+/g, '');
    if (CIN_SHAPE.test(compact)) suggestion = compact;
  }

  // Positions are only meaningful for exactly 21 clean characters.
  if (length !== 21 || chars.hasProblems) {
    return { issues, suggestion };
  }

  const listing = value.slice(0, 1);
  const industry = value.slice(1, 6);
  const state = value.slice(6, 8);
  const yearText = value.slice(8, 12);
  const typeCode = value.slice(12, 15);
  const registration = value.slice(15, 21);

  if (listing !== 'L' && listing !== 'U') {
    issues.push({
      code: 'CIN_LISTING',
      severity: 'error',
      message: `The first character must be L (listed) or U (unlisted). Found "${listing}".`,
    });
  }
  if (!/^\d{5}$/.test(industry)) {
    issues.push({
      code: 'CIN_INDUSTRY',
      severity: 'error',
      message: `The industry code (characters 2–6) must contain five digits. Found "${industry}".`,
    });
  }
  if (!/^[A-Z]{2}$/.test(state)) {
    issues.push({
      code: 'CIN_STATE_FORMAT',
      severity: 'error',
      message: `The state code (characters 7–8) must be two letters. Found "${state}".`,
    });
  } else if (!(state in STATE_CODES)) {
    issues.push({
      code: 'CIN_STATE_UNKNOWN',
      severity: 'review',
      message: `The state code ${state} is not recognized in the supported reference data. The format is correct, but we cannot confirm the state.`,
    });
  }

  let year: number | null = null;
  if (!/^\d{4}$/.test(yearText)) {
    issues.push({
      code: 'CIN_YEAR_FORMAT',
      severity: 'error',
      message: `The incorporation year (characters 9–12) must be four digits. Found "${yearText}".`,
    });
  } else {
    year = Number(yearText);
    if (year > currentYear) {
      issues.push({
        code: 'CIN_YEAR_FUTURE',
        severity: 'error',
        message: `The incorporation year ${year} is in the future. It cannot be later than ${currentYear}.`,
      });
    } else if (year < EARLIEST_PLAUSIBLE_YEAR) {
      issues.push({
        code: 'CIN_YEAR_IMPLAUSIBLE',
        severity: 'review',
        message: `The incorporation year ${year} is earlier than ${EARLIEST_PLAUSIBLE_YEAR}, before Indian company law existed. Please check it.`,
      });
    }
  }

  if (!/^[A-Z]{3}$/.test(typeCode)) {
    issues.push({
      code: 'CIN_TYPE_FORMAT',
      severity: 'error',
      message: `The company type code (characters 13–15) must be three letters. Found "${typeCode}".`,
    });
  } else if (!(typeCode in COMPANY_TYPES)) {
    issues.push({
      code: 'CIN_TYPE_UNKNOWN',
      severity: 'review',
      message: `The company type code ${typeCode} is not recognized in the supported reference data. The format is correct, but we cannot confirm the type.`,
    });
  }
  if (!/^\d{6}$/.test(registration)) {
    issues.push({
      code: 'CIN_REGISTRATION',
      severity: 'error',
      message: `The registration number (characters 16–21) must be six digits. Found "${registration}".`,
    });
  }

  if (issues.some((i) => i.severity === 'error')) return { issues, suggestion };

  return { issues, suggestion, cin: decode({ listing, industry, state, year, typeCode, registration }) };
}

interface Parts {
  listing: string;
  industry: string;
  state: string;
  year: number | null;
  typeCode: string;
  registration: string;
}

/** Turns already-checked parts into the structure the UI displays. */
function decode(p: Parts): CinDecoded {
  const stateEntry = STATE_CODES[p.state];
  const typeEntry = COMPANY_TYPES[p.typeCode];
  const listing = p.listing === 'L' ? 'Listed' : 'Unlisted';

  const segments: DecodedSegment[] = [
    {
      key: 'listing', label: 'Listing status', positions: '1', raw: p.listing,
      meaning: p.listing === 'L' ? 'Listed on a stock exchange' : 'Unlisted',
    },
    {
      key: 'industry', label: 'Industry code', positions: '2–6', raw: p.industry,
      meaning: 'Five-digit industry classification code',
      note: 'Shown as recorded. This tool does not translate it into an industry name.',
    },
    {
      key: 'state', label: 'State / UT code', positions: '7–8', raw: p.state,
      meaning: stateEntry?.name ?? null,
      note: stateEntry?.note,
    },
    {
      key: 'year', label: 'Year of incorporation', positions: '9–12', raw: String(p.year ?? ''),
      meaning: p.year === null ? null : `Incorporated in ${p.year}`,
    },
    {
      key: 'type', label: 'Company type', positions: '13–15', raw: p.typeCode,
      meaning: typeEntry?.name ?? null,
      note: typeEntry?.description,
    },
    {
      key: 'registration', label: 'Registration number', positions: '16–21', raw: p.registration,
      meaning: 'Six-digit number allotted by the Registrar of Companies',
    },
  ];

  return {
    listing,
    industryCode: p.industry,
    stateCode: p.state,
    state: stateEntry?.name ?? null,
    year: p.year,
    typeCode: p.typeCode,
    companyType: typeEntry?.name ?? null,
    registrationNumber: p.registration,
    segments,
  };
}
