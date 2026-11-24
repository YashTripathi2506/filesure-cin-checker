import { describe, expect, it } from 'vitest';
import { countNonEmptyLines, normalizeIdentifier, parseAndValidate } from '../lib/parseIdentifiers';
import { validateCIN } from '../lib/validateCIN';
import { validateLLPIN } from '../lib/validateLLPIN';

/**
 * All identifiers below marked SYNTHETIC are invented for testing. They follow the CIN layout
 * (1 + 5 + 2 + 4 + 3 + 6 = 21 characters) but are NOT real registered companies.
 * Expected values come from the format rules in docs/research.md, not from the implementation.
 */
const NOW = { currentYear: 2026 };
const one = (text: string) => parseAndValidate(text, NOW)[0];
const codes = (text: string) => one(text).issues.map((i) => i.code);

// Layout reference for building cases:  L 17110 MH 1973 PLC 019786
const LISTED_EXAMPLE = 'L17110MH1973PLC019786'; // example from the FileSure assignment brief
const UNLISTED_PTC = 'U72900KA2021PTC123456'; // SYNTHETIC
const OPC = 'U74999DL2019OPC123456'; // SYNTHETIC
const GOI = 'U40100DL1990GOI054321'; // SYNTHETIC
const SGC = 'U40101TG2004SGC000001'; // SYNTHETIC

describe('valid CINs', () => {
  it('decodes the assignment example segment by segment', () => {
    const r = one(LISTED_EXAMPLE);
    expect(r.status).toBe('valid');
    expect(r.kind).toBe('company');
    expect(r.cin).toMatchObject({
      listing: 'Listed',
      industryCode: '17110',
      stateCode: 'MH',
      state: 'Maharashtra',
      year: 1973,
      typeCode: 'PLC',
      companyType: 'Public limited company',
      registrationNumber: '019786',
    });
  });

  it('decodes an unlisted private company', () => {
    const r = one(UNLISTED_PTC);
    expect(r.status).toBe('valid');
    expect(r.cin?.listing).toBe('Unlisted');
    expect(r.cin?.state).toBe('Karnataka');
    expect(r.cin?.companyType).toBe('Private limited company');
  });

  it('decodes a one person company', () => {
    expect(one(OPC).cin?.companyType).toBe('One person company');
  });

  it('decodes Government of India and State government company codes', () => {
    expect(one(GOI).cin?.companyType).toBe('Government of India company');
    expect(one(SGC).cin?.companyType).toBe('State government company');
  });

  it('accepts both Uttarakhand state codes seen in real CINs (UR older, UT newer)', () => {
    expect(one('U45309UR2017PTC007687').cin?.state).toBe('Uttarakhand'); // SYNTHETIC
    expect(one('U68100UT2023PTC015354').cin?.state).toBe('Uttarakhand'); // SYNTHETIC
  });

  it('accepts TG for a company incorporated before Telangana existed (real CINs do this)', () => {
    const r = one('L72200TG1996PLC024351'); // layout of a real BSE filing; treated as a format test only
    expect(r.status).toBe('valid');
    expect(r.cin?.state).toBe('Telangana');
  });

  it('produces six labelled segments covering all 21 characters in order', () => {
    const segs = one(LISTED_EXAMPLE).cin!.segments;
    expect(segs.map((s) => s.raw).join('')).toBe(LISTED_EXAMPLE);
    expect(segs.map((s) => s.positions)).toEqual(['1', '2–6', '7–8', '9–12', '13–15', '16–21']);
  });
});

describe('invalid CINs: every problem is reported with a precise message', () => {
  it('rejects a 20-character CIN and says how many characters it has', () => {
    const r = one('L17110MH1973PLC01978');
    expect(r.status).toBe('invalid');
    expect(r.issues[0].message).toBe('A CIN must contain exactly 21 characters. This input contains 20.');
  });

  it('rejects a 22-character CIN', () => {
    expect(one(LISTED_EXAMPLE + '7').issues[0].message).toContain('contains 22');
  });

  it('rejects an invalid listing status', () => {
    const r = one('X17110MH1973PLC019786');
    expect(codes('X17110MH1973PLC019786')).toContain('CIN_LISTING');
    expect(r.issues[0].message).toContain('L (listed) or U (unlisted)');
  });

  it('rejects non-numeric industry codes', () => {
    expect(codes('L17A10MH1973PLC019786')).toEqual(['CIN_INDUSTRY']);
  });

  it('rejects a state code that is not two letters', () => {
    expect(codes('L171101H1973PLC019786')).toEqual(['CIN_STATE_FORMAT']);
  });

  it('marks an unknown but well-formed state code as "review", not invalid', () => {
    const r = one('L17110XX1973PLC019786');
    expect(r.status).toBe('review');
    expect(r.issues[0].message).toContain('The state code XX is not recognized');
    expect(r.cin?.state).toBeNull();
  });

  it('rejects a future incorporation year', () => {
    const r = one('U72900KA2027PTC123456');
    expect(r.status).toBe('invalid');
    expect(codes('U72900KA2027PTC123456')).toEqual(['CIN_YEAR_FUTURE']);
  });

  it('accepts the current year', () => {
    expect(one('U72900KA2026PTC123456').status).toBe('valid');
  });

  it('rejects a non-numeric year', () => {
    expect(codes('U72900KA20A1PTC123456')).toEqual(['CIN_YEAR_FORMAT']);
  });

  it('flags a year before 1850 for review instead of rejecting it', () => {
    expect(one('U72900KA1800PTC123456').status).toBe('review');
  });

  it('marks an unknown company type code as review', () => {
    const r = one('U72900KA2021XYZ123456');
    expect(r.status).toBe('review');
    expect(r.issues[0].message).toContain('The company type code XYZ is not recognized');
  });

  it('rejects a company type with digits', () => {
    expect(codes('U72900KA2021P1C123456')).toEqual(['CIN_TYPE_FORMAT']);
  });

  it('rejects a registration number containing letters', () => {
    expect(codes('U72900KA2021PTC12345A')).toEqual(['CIN_REGISTRATION']);
  });

  it('reports several errors at once instead of stopping at the first', () => {
    const r = one('X17A10XX2099PTC12345Z');
    expect(r.status).toBe('invalid');
    expect(codes('X17A10XX2099PTC12345Z')).toEqual(
      expect.arrayContaining(['CIN_LISTING', 'CIN_INDUSTRY', 'CIN_YEAR_FUTURE', 'CIN_REGISTRATION', 'CIN_STATE_UNKNOWN']),
    );
  });

  it('rejects unrelated text without throwing', () => {
    const r = one('hello world, this is not an identifier');
    expect(r.status).toBe('invalid');
    expect(r.issues.length).toBeGreaterThan(0);
  });
});

describe('normalisation policy', () => {
  it('trims surrounding whitespace and tells the user', () => {
    const r = one(`   ${LISTED_EXAMPLE}  \t`);
    expect(r.status).toBe('valid');
    expect(r.original).toBe(`   ${LISTED_EXAMPLE}  \t`); // original preserved
    expect(r.normalized).toBe(LISTED_EXAMPLE);
    expect(r.notes.join(' ')).toContain('spaces were ignored');
  });

  it('accepts lowercase input and tells the user it was uppercased', () => {
    const r = one(UNLISTED_PTC.toLowerCase());
    expect(r.status).toBe('valid');
    expect(r.normalized).toBe(UNLISTED_PTC);
    expect(r.notes.join(' ')).toContain('Lowercase');
  });

  it('does NOT silently repair internal whitespace; suggests a fix instead', () => {
    const r = one('L17110 MH1973PLC019786');
    expect(r.status).toBe('invalid');
    expect(codes('L17110 MH1973PLC019786')).toContain('INTERNAL_SPACE');
    expect(r.suggestion).toBe(LISTED_EXAMPLE);
    expect(r.cin).toBeUndefined();
  });

  it('rejects look-alike Cyrillic letters and names the character', () => {
    const r = one('\u0410AA-1234'); // Cyrillic capital A (U+0410) + "AA-1234"
    expect(r.status).toBe('invalid');
    expect(r.issues.map((i) => i.code)).toContain('NON_ASCII');
    expect(r.issues[0].message).toContain('U+0410');
  });

  it('rejects fullwidth characters in a CIN', () => {
    const fullwidthL = '\uFF2C' + LISTED_EXAMPLE.slice(1); // fullwidth "L"
    const r = one(fullwidthL);
    expect(r.status).toBe('invalid');
    expect(r.issues.map((i) => i.code)).toContain('NON_ASCII');
  });

  it('exposes normalizeIdentifier directly', () => {
    expect(normalizeIdentifier('  aaa-1234 ').normalized).toBe('AAA-1234');
  });
});

describe('LLPIN', () => {
  it('accepts the assignment example AAA-1234', () => {
    const r = one('AAA-1234');
    expect(r.status).toBe('valid');
    expect(r.kind).toBe('llp');
    expect(r.cin).toBeUndefined();
    expect(r.issues).toEqual([]);
  });

  it('accepts lowercase LLPINs with a note', () => {
    const r = one('abb-3106');
    expect(r.status).toBe('valid');
    expect(r.normalized).toBe('ABB-3106');
  });

  it('rejects a missing hyphen and suggests the fix without applying it', () => {
    const r = one('AAA1234');
    expect(r.status).toBe('invalid');
    expect(r.issues[0].code).toBe('LLPIN_MISSING_HYPHEN');
    expect(r.suggestion).toBe('AAA-1234');
  });

  it('rejects a wrong prefix (digits instead of letters)', () => {
    expect(validateLLPIN('A1A-1234').issues.map((i) => i.code)).toContain('LLPIN_PREFIX');
  });

  it('rejects wrong lengths', () => {
    expect(validateLLPIN('AAAA-1234').issues.map((i) => i.code)).toEqual(
      expect.arrayContaining(['LLPIN_LENGTH', 'LLPIN_PREFIX']),
    );
    expect(validateLLPIN('AAA-123').issues.map((i) => i.code)).toContain('LLPIN_DIGITS');
  });

  it('rejects letters in the numeric part', () => {
    expect(validateLLPIN('AAA-12B4').issues.map((i) => i.code)).toContain('LLPIN_DIGITS');
  });

  it('rejects a typographic en dash and suggests a normal hyphen', () => {
    const r = one('AAA\u20131234');
    expect(r.status).toBe('invalid');
    expect(r.issues.map((i) => i.code)).toContain('NON_ASCII');
    expect(r.suggestion).toBe('AAA-1234');
  });

  it('rejects special characters and multiple hyphens', () => {
    expect(codes('AAA-12$4')).toContain('SPECIAL_CHARACTERS');
    expect(codes('A-A-A-1234')).toContain('LLPIN_HYPHENS');
  });
});

describe('batches, line endings and duplicates', () => {
  it('ignores empty lines but keeps order and original line numbers', () => {
    const results = parseAndValidate(`AAA-1234\n\n   \n${LISTED_EXAMPLE}`, NOW);
    expect(results.map((r) => r.row)).toEqual([1, 2]);
    expect(results.map((r) => r.line)).toEqual([1, 4]);
  });

  it('returns nothing for empty input', () => {
    expect(parseAndValidate('', NOW)).toEqual([]);
    expect(parseAndValidate(' \n\t\n', NOW)).toEqual([]);
    expect(countNonEmptyLines('')).toBe(0);
  });

  it('handles Windows (CRLF), Unix (LF) and old Mac (CR) line endings identically', () => {
    const crlf = parseAndValidate(`AAA-1234\r\n${LISTED_EXAMPLE}\r\n`, NOW);
    const lf = parseAndValidate(`AAA-1234\n${LISTED_EXAMPLE}\n`, NOW);
    const cr = parseAndValidate(`AAA-1234\r${LISTED_EXAMPLE}`, NOW);
    expect(crlf.map((r) => r.normalized)).toEqual(['AAA-1234', LISTED_EXAMPLE]);
    expect(lf.map((r) => r.status)).toEqual(crlf.map((r) => r.status));
    expect(cr).toHaveLength(2);
  });

  it('keeps duplicates, and marks later ones with the row of the first', () => {
    const r = parseAndValidate(`AAA-1234\n${LISTED_EXAMPLE}\naaa-1234`, NOW);
    expect(r).toHaveLength(3);
    expect(r[0].duplicateCount).toBe(2);
    expect(r[2].duplicateOf).toBe(1);
    expect(r[1].duplicateOf).toBeUndefined();
    expect(r.every((x) => x.status === 'valid')).toBe(true);
  });

  it('mixes CINs, LLPINs and junk while preserving input order', () => {
    const r = parseAndValidate(`${LISTED_EXAMPLE}\nAAA-1234\nnot-an-id\n${UNLISTED_PTC}`, NOW);
    expect(r.map((x) => x.kind)).toEqual(['company', 'llp', 'llp', 'company']);
    expect(r.map((x) => x.status)).toEqual(['valid', 'valid', 'invalid', 'valid']);
  });

  it('processes 500 synthetic identifiers quickly and correctly', () => {
    const lines: string[] = [];
    for (let i = 0; i < 500; i++) {
      if (i % 5 === 0) lines.push(`AAA-${String(1000 + i).padStart(4, '0')}`); // 100 LLPINs
      else if (i % 5 === 1) lines.push(`U72900MH2020PTC${String(i).padStart(6, '0')}`); // SYNTHETIC
      else if (i % 5 === 2) lines.push(`L17110GJ1990PLC${String(i).padStart(6, '0')}`); // SYNTHETIC
      else if (i % 5 === 3) lines.push('BADVALUE' + i);
      else lines.push(`U72900MH2020PTC${String(i).padStart(5, '0')}`); // 20 chars: invalid
    }
    const start = performance.now();
    const results = parseAndValidate(lines.join('\n'), NOW);
    const elapsed = performance.now() - start;
    expect(results).toHaveLength(500);
    expect(results.filter((r) => r.status === 'valid')).toHaveLength(300);
    expect(results.filter((r) => r.status === 'invalid')).toHaveLength(200);
    expect(results.filter((r) => r.kind === 'llp' && r.status === 'valid')).toHaveLength(100);
    expect(elapsed).toBeLessThan(1000);
  });
});

describe('direct engine calls', () => {
  it('validateCIN uses the injected year, so tests do not depend on the clock', () => {
    expect(validateCIN('U72900KA2026PTC123456', { currentYear: 2025 }).issues.map((i) => i.code)).toContain('CIN_YEAR_FUTURE');
    expect(validateCIN('U72900KA2026PTC123456', { currentYear: 2026 }).issues).toEqual([]);
  });
});
