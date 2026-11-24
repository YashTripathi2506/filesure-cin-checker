# Code walkthrough (read this before the live interview)

## Startup
`index.html` loads `src/main.tsx`, which renders `<App />` into `#root`. `App.tsx` owns **all** state; components receive props and call callbacks (props down, events up). No context, no router.

## The flow when you click "Validate identifiers"
`InputPanel.onValidate` -> `App.runValidation(text)` -> `parseAndValidate(text)` (src/lib/parseIdentifiers.ts) -> `setResults(...)`. Filters, search and paging are *derived* with `useMemo` from `results`, so nothing can go stale.

## Normalisation (`normalizeIdentifier`)
Trim, then uppercase ASCII letters. Both add a note. Everything else is left alone so bad input stays bad. Key point: **the original string is stored separately** (`original` vs `normalized`).

## Choosing CIN or LLPIN (`detectKind`)
A hyphen-like character, or length <= 8, means "LLPIN attempt"; otherwise "CIN attempt". It only picks the validator.

## CIN segmentation (`validateCIN`)
1. `analyseCharacters`: spaces, non-ASCII, special characters.
2. Length must be 21 (counted with `Array.from`, so emoji count once).
3. If length or characters are wrong, stop (positions are meaningless).
4. Otherwise slice by position: `value.slice(0,1)` listing, `(1,6)` industry, `(6,8)` state, `(8,12)` year, `(12,15)` type, `(15,21)` registration.
5. Each slice has its own regex and message. Errors accumulate in one `issues` array.
6. No errors -> `decode()` builds the segments the UI shows.

## Regular expressions used
| Regex | Means |
|---|---|
| `/^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/` | whole CIN (used for suggestions) |
| `/^\d{5}$/` | exactly five digits (`^`/`$` anchor both ends; without them `12345X` would pass) |
| `/^[A-Z]{3}-\d{4}$/` | LLPIN |
| `/[-\u2010-\u2015\u2212]/` | hyphen or look-alike dashes |

## Mappings
`STATE_CODES` and `COMPANY_TYPES` are plain objects. `state in STATE_CODES` decides recognised vs "review". Add a code = add one line (plus the evidence in `docs/research.md`).

## Error severity
`error` = structure wrong -> status `invalid`. `review` = structure right, code unknown -> status `review`. Status is computed in `parseAndValidate`.

## Filtering
`matchesFilter(result, filter)` in `ResultsSummary.tsx`. `App` filters, then searches, then slices a page.

## Export (`exportData.ts`, `exportPDF.ts`)
`resultToRow` turns a result into display strings. `buildPDF` loads jsPDF + autotable on demand, writes the title, summary and disclaimer, then `autoTable` draws the rows with page numbers; `downloadPDF` calls `doc.save`. `pdfSafe` replaces characters the PDF font cannot print. `toTSV` (Copy results) neutralises spreadsheet formulas.

## Large datasets
Validation of 500 lines is milliseconds (a test asserts < 1s). Rendering is the cost, so only 50 rows render per page.

## Recipes
- **New validation rule:** add a check inside `validateCIN`, push an `Issue` with a new `code`, add a test in `validation.test.ts`.
- **New company type:** add a line to `COMPANY_TYPES`; add a test; add evidence to research.md.
- **New filter:** add to the `Filter` union and `matchesFilter`, add a tile in `ResultsSummary`.
- **New table column:** add `<th>` and `<td data-label="...">` in `ResultsTable.tsx` (and a column in `exportData.ts` and `exportPDF.ts` if exported).
- **Run one test:** `npx vitest run -t "future incorporation year"`.
- **Write a test:** copy any `it(...)` in `validation.test.ts`; expected values must come from the format rules, not from running the code.
