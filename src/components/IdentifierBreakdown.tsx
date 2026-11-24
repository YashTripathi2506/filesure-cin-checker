import type { CinDecoded } from '../types';

/** Colour-tinted boxes (tints are decoration only; every box also carries a text label and positions). */
export default function IdentifierBreakdown({ cin }: { cin: CinDecoded }) {
  return (
    <div className="breakdown">
      <p className="breakdown-title">How this CIN is built</p>
      <div className="breakdown-code" aria-hidden="true">
        {cin.segments.map((s, i) => (
          <span key={s.key} className={`seg seg-${i + 1}`}>{s.raw}</span>
        ))}
      </div>
      <ol className="breakdown-list">
        {cin.segments.map((s, i) => (
          <li key={s.key} className={`seg-card seg-${i + 1}`}>
            <span className="seg-label">{s.label} <span className="seg-pos">(characters {s.positions})</span></span>
            <span className="seg-raw">{s.raw}</span>
            <span className="seg-meaning">
              {s.meaning ?? <em>Not recognised in the supported reference data</em>}
            </span>
            {s.note && <span className="seg-note">{s.note}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
