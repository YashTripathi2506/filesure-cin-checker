import { Fragment } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, XCircle } from 'lucide-react';
import type { ValidationResult } from '../types';
import IdentifierBreakdown from './IdentifierBreakdown';

interface Props {
  rows: ValidationResult[];
  expanded: Set<number>;
  onToggle: (row: number) => void;
}

function StatusBadge({ status }: { status: ValidationResult['status'] }) {
  if (status === 'valid') return <span className="badge badge-good"><CheckCircle2 size={14} aria-hidden="true" /> Valid</span>;
  if (status === 'review') return <span className="badge badge-warn"><AlertTriangle size={14} aria-hidden="true" /> Needs review</span>;
  return <span className="badge badge-bad"><XCircle size={14} aria-hidden="true" /> Invalid</span>;
}

const NOT_ENCODED = <span className="muted">Not encoded in LLPIN</span>;
const DASH = <span className="muted" aria-label="Not available">&mdash;</span>;

function Details({ r }: { r: ValidationResult }) {
  return (
    <div className="details">
      {r.issues.length > 0 ? (
        <ul className="issues">
          {r.issues.map((i) => (
            <li key={i.code + i.message} className={i.severity === 'error' ? 'issue-error' : 'issue-review'}>{i.message}</li>
          ))}
        </ul>
      ) : (
        <p>
          {r.kind === 'llp'
            ? 'Format is valid. State, year and listing status are not encoded in an LLPIN.'
            : 'Format is valid. Not checked against MCA records.'}
        </p>
      )}
      {r.suggestion && (
        <p className="suggestion">Did you mean <code>{r.suggestion}</code>? (Suggestion only, not applied.)</p>
      )}
      {r.notes.map((n) => <p key={n} className="note">{n}</p>)}
      {r.duplicateOf && <p className="note">Duplicate of row {r.duplicateOf}.</p>}
      {!r.duplicateOf && r.duplicateCount > 1 && <p className="note">Appears {r.duplicateCount} times in your list.</p>}
    </div>
  );
}

export default function ResultsTable({ rows, expanded, onToggle }: Props) {
  return (
    <div className="table-wrap">
      <table className="results">
        <caption className="sr-only">Validation results in the order they were entered</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Identifier</th>
            <th scope="col">Status</th>
            <th scope="col">Type</th>
            <th scope="col">Listing</th>
            <th scope="col">State</th>
            <th scope="col">Year</th>
            <th scope="col">Company type</th>
            <th scope="col">Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const c = r.cin;
            const isLlp = r.kind === 'llp';
            const open = expanded.has(r.row);
            return (
              <Fragment key={r.row}>
                <tr className={`row-${r.status}`}>
                  <td data-label="Row">{r.row}</td>
                  <td data-label="Identifier" className="id-cell">
                    <code className="identifier">{r.original.trim() || r.original}</code>
                  </td>
                  <td data-label="Status"><StatusBadge status={r.status} /></td>
                  <td data-label="Type">
                    {isLlp ? 'LLP' : 'Company'}
                    {r.status === 'invalid' && <span className="muted"> (as entered)</span>}
                  </td>
                  <td data-label="Listing">{isLlp ? NOT_ENCODED : (c?.listing ?? DASH)}</td>
                  <td data-label="State">
                    {isLlp ? NOT_ENCODED : c ? (c.state ?? <span className="muted">Unrecognised ({c.stateCode})</span>) : DASH}
                  </td>
                  <td data-label="Year">{isLlp ? NOT_ENCODED : (c?.year ?? DASH)}</td>
                  <td data-label="Company type">
                    {isLlp ? <span className="muted">Not applicable</span> : c ? (c.companyType ?? <span className="muted">Unrecognised ({c.typeCode})</span>) : DASH}
                  </td>
                  <td data-label="Details">
                    <Details r={r} />
                    {c && (
                      <button
                        type="button"
                        className="link-button decode-toggle"
                        aria-expanded={open}
                        aria-controls={`decode-${r.row}`}
                        onClick={() => onToggle(r.row)}
                      >
                        {open ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                        {open ? 'Hide breakdown' : 'Show breakdown'}
                      </button>
                    )}
                  </td>
                </tr>
                {c && open && (
                  <tr className="decode-row">
                    <td colSpan={9} id={`decode-${r.row}`}>
                      <IdentifierBreakdown cin={c} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
