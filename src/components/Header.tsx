import { useState } from 'react';
import { Info, ShieldCheck } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-row">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><ShieldCheck size={18} /></span>
          <span className="brand-name">FileSure CIN Checker</span>
        </div>
        <p className="disclosure">Independent technical assignment for FileSure</p>
        <button
          type="button"
          className="link-button"
          aria-expanded={open}
          aria-controls="about-panel"
          onClick={() => setOpen((v) => !v)}
        >
          <Info size={16} aria-hidden="true" /> About this tool
        </button>
      </div>
      {open && (
        <div id="about-panel" className="about-panel">
          <div className="container">
            <p>
              Paste CINs (company numbers) and LLPINs (LLP numbers), one per line. The tool checks each one&rsquo;s
              format and explains what the characters stand for. Everything runs in your browser; nothing you paste
              is sent anywhere.
            </p>
            <p>
              It does <strong>not</strong> look anything up on the Ministry of Corporate Affairs (MCA) register. A
              well-formed number can still belong to no company at all. Built by Yash Tripathi as a technical
              assignment for FileSure. It is not an official FileSure product.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
