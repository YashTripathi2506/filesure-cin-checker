import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../App';
import ResultsTable from '../components/ResultsTable';
import { SAMPLE_DATA } from '../data/sampleData';
import { parseAndValidate } from '../lib/parseIdentifiers';

/** Smoke tests: components render real data without throwing. They do not replace manual browser testing. */
describe('component smoke tests (server render)', () => {
  it('renders the empty state with the required headings and actions', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Validate and decode CINs &amp; LLPINs');
    expect(html).toContain('Validate identifiers');
    expect(html).toContain('Try sample data');
    expect(html).toContain('Clear');
    expect(html).toContain('does not independently verify company existence');
  });

  it('renders every sample row, with LLP attributes shown as "Not encoded in LLPIN"', () => {
    const results = parseAndValidate(SAMPLE_DATA, { currentYear: 2026 });
    const html = renderToStaticMarkup(<ResultsTable rows={results} expanded={new Set([1])} onToggle={() => {}} />);
    expect(html).toContain('Maharashtra');
    expect(html).toContain('Not encoded in LLPIN');
    expect(html).toContain('How this CIN is built'); // row 1 expanded
    expect(html).toContain('Did you mean'); // suggestion shown for AAA1234
    expect((html.match(/<tr class="row-/g) ?? []).length).toBe(results.length);
  });
});
