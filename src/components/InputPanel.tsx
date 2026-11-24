import { Eraser, FlaskConical, ShieldCheck } from 'lucide-react';

interface Props {
  value: string;
  lineCount: number;
  stale: boolean;
  onChange: (value: string) => void;
  onValidate: () => void;
  onSample: () => void;
  onClear: () => void;
}

const PLACEHOLDER = 'L17110MH1973PLC019786\nAAA-1234\n\nOne CIN or LLPIN per line';

export default function InputPanel({ value, lineCount, stale, onChange, onValidate, onSample, onClear }: Props) {
  return (
    <section className="panel" aria-labelledby="input-label">
      <div className="label-row">
        <label id="input-label" htmlFor="identifiers" className="field-label">CINs and LLPINs, one per line</label>
        <span className="line-count" aria-live="polite">
          {lineCount === 0 ? 'No identifiers yet' : `${lineCount} ${lineCount === 1 ? 'identifier' : 'identifiers'}`}
        </span>
      </div>
      <textarea
        id="identifiers"
        className="workspace"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDER}
        spellCheck={false}
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        rows={8}
        aria-describedby="input-help"
      />
      <p id="input-help" className="help">
        A CIN has 21 characters (e.g. L17110MH1973PLC019786). An LLPIN is three letters, a hyphen and four digits
        (e.g. AAA-1234). You can mix both, paste hundreds at once, and blank lines are ignored.
      </p>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onValidate} disabled={lineCount === 0}>
          <ShieldCheck size={16} aria-hidden="true" /> Validate identifiers
        </button>
        <button type="button" className="btn" onClick={onSample}>
          <FlaskConical size={16} aria-hidden="true" /> Try sample data
        </button>
        <button type="button" className="btn btn-quiet" onClick={onClear} disabled={value === ''}>
          <Eraser size={16} aria-hidden="true" /> Clear
        </button>
      </div>
      {stale && <p className="stale" role="note">The text has changed since the last check. Validate again to update the results.</p>}
    </section>
  );
}
