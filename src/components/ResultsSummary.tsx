import type { ValidationResult } from '../types';

export type Filter = 'all' | 'valid' | 'invalid' | 'review' | 'company' | 'llp';

interface Props {
  results: ValidationResult[];
  filter: Filter;
  onFilter: (f: Filter) => void;
}

export function matchesFilter(r: ValidationResult, f: Filter): boolean {
  switch (f) {
    case 'all': return true;
    case 'valid': return r.status === 'valid';
    case 'invalid': return r.status === 'invalid';
    case 'review': return r.status === 'review';
    case 'company': return r.kind === 'company';
    case 'llp': return r.kind === 'llp';
  }
}

export default function ResultsSummary({ results, filter, onFilter }: Props) {
  const count = (f: Filter) => results.filter((r) => matchesFilter(r, f)).length;
  const tiles: { id: Filter; label: string; tone?: string }[] = [
    { id: 'all', label: 'Total' },
    { id: 'valid', label: 'Valid', tone: 'good' },
    { id: 'invalid', label: 'Invalid', tone: 'bad' },
    ...(count('review') > 0 ? [{ id: 'review' as Filter, label: 'Needs review', tone: 'warn' }] : []),
    { id: 'company', label: 'Companies' },
    { id: 'llp', label: 'LLPs' },
  ];

  return (
    <div className="summary" role="group" aria-label="Filter results by category">
      {tiles.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tile ${t.tone ? `tile-${t.tone}` : ''}`}
          aria-pressed={filter === t.id}
          onClick={() => onFilter(t.id)}
        >
          <span className="tile-count">{count(t.id)}</span>
          <span className="tile-label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
