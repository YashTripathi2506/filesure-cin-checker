import { useMemo, useRef, useState } from 'react';
import { Copy, Download, FileWarning, Search } from 'lucide-react';
import Footer from './components/Footer';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ResultsSummary, { matchesFilter, type Filter } from './components/ResultsSummary';
import ResultsTable from './components/ResultsTable';
import { SAMPLE_DATA } from './data/sampleData';
import { toTSV } from './lib/exportData';
import { downloadPDF } from './lib/exportPDF';
import { countNonEmptyLines, parseAndValidate } from './lib/parseIdentifiers';
import type { ValidationResult } from './types';

const PAGE_SIZE = 50;

export default function App() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [checkedText, setCheckedText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const lineCount = useMemo(() => countNonEmptyLines(text), [text]);

  const visible = useMemo(() => {
    if (!results) return [];
    const q = query.trim().toUpperCase();
    return results.filter(
      (r) =>
        matchesFilter(r, filter) &&
        (q === '' || r.normalized.includes(q) || r.original.toUpperCase().includes(q) ||
          r.cin?.state?.toUpperCase().includes(q) || r.cin?.companyType?.toUpperCase().includes(q)),
    );
  }, [results, filter, query]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = visible.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function runValidation(source: string) {
    const next = parseAndValidate(source);
    setResults(next);
    setCheckedText(source);
    setFilter('all');
    setQuery('');
    setPage(0);
    setExpanded(new Set());
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }),
    );
  }

  function handleSample() {
    setText(SAMPLE_DATA);
    runValidation(SAMPLE_DATA);
  }

  function handleClear() {
    setText('');
    setResults(null);
    setCheckedText('');
    setFilter('all');
    setQuery('');
    setPage(0);
    setExpanded(new Set());
  }

  function toggleRow(row: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(row)) next.delete(row);
      else next.add(row);
      return next;
    });
  }

  async function copyResults() {
    if (!results) return;
    try {
      await navigator.clipboard.writeText(toTSV(visible));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const invalidCount = results?.filter((r) => r.status === 'invalid').length ?? 0;
  const announcement = results
    ? `Checked ${results.length} ${results.length === 1 ? 'identifier' : 'identifiers'}: ${results.filter((r) => r.status === 'valid').length} valid, ${invalidCount} invalid, ${results.filter((r) => r.status === 'review').length} need review.`
    : '';

  return (
    <>
      <Header />
      <main className="container main">
        <div className="intro">
          <h1>Validate and decode CINs &amp; LLPINs</h1>
          <p className="tagline">Decode corporate identities. Understand every character.</p>
          <p className="lede">
            Paste your corporate identification numbers below to check their format and understand what each number represents.
          </p>
        </div>

        <InputPanel
          value={text}
          lineCount={lineCount}
          stale={results !== null && text !== checkedText}
          onChange={setText}
          onValidate={() => runValidation(text)}
          onSample={handleSample}
          onClear={handleClear}
        />

        <div className="sr-only" role="status" aria-live="polite">{announcement}</div>

        {results === null && (
          <section className="empty" aria-label="How it works">
            <h2>What you will see</h2>
            <ul>
              <li>Whether each number is correctly formed, and exactly what is wrong if it is not.</li>
              <li>Company or LLP, listed or unlisted, state, year of incorporation and company type.</li>
              <li>A character-by-character breakdown of every valid CIN.</li>
            </ul>
            <p className="muted">
              Format checking only. A well-formed number may not belong to a real company. Use the MCA portal to confirm that.
            </p>
          </section>
        )}

        {results !== null && (
          <section ref={resultsRef} className="results-section" aria-labelledby="results-heading" tabIndex={-1}>
            <h2 id="results-heading">Results</h2>
            <ResultsSummary results={results} filter={filter} onFilter={(f) => { setFilter(f); setPage(0); }} />

            <div className="toolbar">
              <div className="search">
                <Search size={16} aria-hidden="true" />
                <label htmlFor="search" className="sr-only">Search results</label>
                <input
                  id="search"
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(0); }}
                  placeholder="Search identifier, state or type"
                />
              </div>
              <div className="export">
                <button type="button" className="btn btn-small" onClick={() => { void downloadPDF(visible); }} disabled={visible.length === 0}>
                  <Download size={16} aria-hidden="true" /> Download PDF
                </button>
                <button type="button" className="btn btn-small" onClick={copyResults} disabled={visible.length === 0}>
                  <Copy size={16} aria-hidden="true" /> {copied ? 'Copied' : 'Copy results'}
                </button>
                {invalidCount > 0 && (
  <button
    type="button"
    className="btn btn-small"
    onClick={() => {
      const invalidRows = results.filter((r) => r.status === 'invalid');
      void downloadPDF(invalidRows, 'invalid-identifiers-report.pdf', 'Invalid Identifiers Report');
    }}
  >
    <FileWarning size={16} aria-hidden="true" /> Invalid report (PDF)
  </button>
)}
              </div>
            </div>

            {results.length === 0 ? (
              <p className="no-match">No identifiers were found. Paste at least one CIN or LLPIN, one per line.</p>
            ) : visible.length === 0 ? (
              <p className="no-match">
                No results match this filter{query ? ' and search' : ''}.{' '}
                <button type="button" className="link-button" onClick={() => { setFilter('all'); setQuery(''); }}>Show all results</button>
              </p>
            ) : (
              <>
                <ResultsTable rows={rows} expanded={expanded} onToggle={toggleRow} />
                {pageCount > 1 && (
                  <nav className="pager" aria-label="Results pages">
                    <button type="button" className="btn btn-small" onClick={() => setPage(safePage - 1)} disabled={safePage === 0}>Previous</button>
                    <span>Page {safePage + 1} of {pageCount} · {visible.length} results</span>
                    <button type="button" className="btn btn-small" onClick={() => setPage(safePage + 1)} disabled={safePage >= pageCount - 1}>Next</button>
                  </nav>
                )}
              </>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
