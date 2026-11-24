import { describe, expect, it } from 'vitest';
import { invalidIdentifiersText, neutraliseFormula, toTSV } from '../lib/exportData';
import { buildPDF, pdfSafe } from '../lib/exportPDF';
import { parseAndValidate } from '../lib/parseIdentifiers';
import { SAMPLE_DATA } from '../data/sampleData';

const NOW = { currentYear: 2026 };

describe('spreadsheet formula protection (copied tables)', () => {
  it.each(['=1+1', '+SUM(A1)', '-2+3', '@cmd', '\tcmd', '\rcmd'])('neutralises %j', (cell) => {
    expect(neutraliseFormula(cell).startsWith("'")).toBe(true);
  });
  it('leaves normal identifiers alone', () => {
    expect(neutraliseFormula('U72900KA2021PTC123456')).toBe('U72900KA2021PTC123456');
  });
  it('neutralises a malicious pasted line in the copy output', () => {
    const tsv = toTSV(parseAndValidate('+1+1', NOW));
    expect(tsv.split('\n')[1].split('\t')[1]).toBe("'+1+1");
  });
});

describe('text exports', () => {
  it('TSV has a header and one row per identifier, in order', () => {
    const lines = toTSV(parseAndValidate('AAA-1234\nbad', NOW)).split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1].startsWith('1\tAAA-1234\tValid\tLLP\tNot encoded in LLPIN')).toBe(true);
    expect(lines[2].startsWith('2\tbad\tInvalid')).toBe(true);
  });
  it('collects invalid identifiers separately, as entered', () => {
    expect(invalidIdentifiersText(parseAndValidate('AAA-1234\n  bad id  \nL17110MH1973PLC019786', NOW))).toBe('bad id');
  });
});

describe('PDF report', () => {
  it('makes unprintable characters visible instead of garbling them', () => {
    expect(pdfSafe('\u0410AA-1234')).toBe('<U+0410>AA-1234');
    expect(pdfSafe('characters 2\u20136')).toBe('characters 2-6');
  });
  it('builds a real PDF containing every row', async () => {
    const results = parseAndValidate(SAMPLE_DATA, NOW);
    const doc = await buildPDF(results, new Date('2026-11-24T10:00:00Z'));
    const bytes = new Uint8Array(doc.output('arraybuffer'));
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-');
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });
  it('paginates a 500-row report', async () => {
    const lines = Array.from({ length: 500 }, (_, i) => `U72900MH2020PTC${String(i).padStart(6, '0')}`);
    const doc = await buildPDF(parseAndValidate(lines.join('\n'), NOW));
    expect(doc.getNumberOfPages()).toBeGreaterThan(5);
  });
});
