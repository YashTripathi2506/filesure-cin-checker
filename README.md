# FileSure CIN Checker: CIN & LLPIN Checker

*Decode corporate identities. Understand every character.*

Paste Indian company CINs and LLP LLPINs, one per line, and see for each: valid or not (and exactly what is wrong),
company or LLP, listed or unlisted, state, year of incorporation and company type.

**Built by Yash Tripathi as an independent technical assignment for FileSure (filesure.in). It is not an official FileSure product.**

- Live URL: *not deployed yet. Add it here after deploying (see `docs/submission.md`).*
- Screenshots: *not captured yet. Add real ones to `docs/screenshots/` after running the app.*

## What it does and does not do
It checks **format** and **decodes** the codes inside. It does **not** confirm a company exists, is active or is compliant.
That needs MCA records. Three levels are kept apart: structural validity, recognition of codes, MCA verification (the last is out of scope).

## Features
- Validates CINs and LLPINs, mixed, 500+ lines, blank lines ignored, duplicates kept and labelled
- Every problem reported, in plain English (never just "Invalid")
- Three statuses: Valid / Invalid / Needs review (well-formed but a code is not in the reference data)
- Filters (tiles), search, pagination (50/page), expandable colour-coded CIN breakdown
- LLP rows say "Not encoded in LLPIN" instead of inventing data
- PDF report download (A4 landscape, summary, full table, page numbers, disclaimer), copy for spreadsheets (formula-injection-safe), download invalid identifiers
- Keyboard accessible, live-region announcements, status never shown by colour alone
- No backend, no API keys, nothing leaves the browser

## Format (summary; see `docs/research.md` for evidence and gaps)
`L 17110 MH 1973 PLC 019786` = listing (L/U) · industry code (5 digits) · state (2 letters) · year (4 digits) · type (3 letters) · registration number (6 digits).
LLPIN: `AAA-1234` = three letters, hyphen, four digits; carries no state, year or listing information.

## Stack
React 19, Vite, TypeScript, custom CSS, lucide-react, Vitest, ESLint.

## Architecture
```
src/lib/        validateCIN.ts, validateLLPIN.ts, parseIdentifiers.ts, characters.ts, exportData.ts, exportPDF.ts   (pure TypeScript, no React)
src/data/       stateCodes.ts, companyTypes.ts, sampleData.ts                                         (reference tables with evidence basis)
src/components/ Header, InputPanel, ResultsSummary, ResultsTable, IdentifierBreakdown, Footer
src/App.tsx     owns all state; passes props down
src/tests/      validation, export/PDF, render smoke tests
docs/           research, verification log, design decisions, walkthrough, interview prep, video script, submission
```

## Run locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run test     # 58 tests
npm run lint
npm run build
```

## Deploy (Vercel, free)
Push to GitHub, then Vercel > Add New > Project > import the repo. Framework preset "Vite" is auto-detected (build `npm run build`, output `dist`). No environment variables are needed.

## Known limitations
- Reference-level state/type mappings are not individually sampled from MCA (`docs/research.md`). Unknown codes show "Needs review".
- Industry codes are shown as numbers only (no names).
- Foreign company (FCRN) and foreign LLP (FLLPIN) formats are not supported.
- Not tested by me in a real browser at 320-1440px (none was available in the build environment). A manual checklist is in `docs/submission.md`.

## Privacy
Everything is computed in your browser. No requests are made with your data; there are no analytics or third-party scripts.

## Suggested commits
1. `chore: scaffold Vite + React + TypeScript project`
2. `docs: record CIN and LLPIN research and sources`
3. `feat: add CIN and LLPIN validation engine with reference data`
4. `test: add validation and export tests`
5. `feat: build input workspace, results table and CIN decoder`
6. `feat: add filters, search, pagination and PDF export`
7. `docs: add README, verification log and deployment notes`
