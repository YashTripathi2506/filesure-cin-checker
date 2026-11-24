# Interview preparation: 20 questions

Answer in your own words. Open the file named in brackets while answering.

1. **Why client-side only?** Parsing is cheap; privacy (nothing leaves the device); no hosting cost.
2. **Where does validation logic live?** `src/lib`, pure functions with no React, so it is testable and reusable.
3. **How do you tell a CIN from an LLPIN?** `detectKind`: hyphen or <= 8 characters = LLPIN attempt. [parseIdentifiers.ts]
4. **Why three statuses?** Our reference tables are incomplete; "review" avoids false "invalid". [types/index.ts]
5. **Why not fix malformed input automatically?** Silent repair can turn a wrong identifier into a different valid one. We suggest instead.
6. **What does normalisation do?** Trim + uppercase, both reported. [normalizeIdentifier]
7. **How are duplicates handled?** Kept; later ones get `duplicateOf`. A `Map` of first-seen rows.
8. **Why do character errors suppress positional errors?** A 22-character string has no meaningful "positions".
9. **How is the PDF made?** jsPDF + autotable in the browser, lazy-loaded; unprintable characters shown as <U+XXXX>. [exportPDF.ts] Copy output neutralises spreadsheet formulas. [neutraliseFormula]
10. **How does the mobile layout work?** CSS turns `tr`/`td` into blocks; `td::before` shows `data-label`. [index.css]
11. **How is accessibility handled?** Labels, `aria-pressed` tiles, `role=status` live region, icons + text for status, focus rings.
12. **Why does `useMemo` appear?** To derive filtered rows only when inputs change.
13. **What happens with 500+ lines?** Validated instantly; paging renders 50 rows.
14. **What can't this tool tell you?** Whether the company exists. Say it clearly.
15. **Which of your mappings are weakest?** Reference-level ones in `research.md`.

### Live modification exercises (practise each once)
16. **Add a company type** (e.g. a new code): one line in `companyTypes.ts` + a test. Run `npm run test`.
17. **Reject years before 1900** instead of "review": in `validateCIN`, change the `severity` of `CIN_YEAR_IMPLAUSIBLE` to `'error'` and the constant; update the test.
18. **Add a "Duplicates" filter:** add `'duplicate'` to `Filter`, `case 'duplicate': return r.duplicateCount > 1`, add tile.
19. **Change the PDF columns:** edit the `head` array, the `body` mapping and `columnStyles` in `buildPDF` together; update the PDF test.
20. **Debug an unexpected identifier:** paste it, read the issue codes; reproduce as a failing test first, then fix. Example: a pasted "AAA‑1234" with a non-breaking hyphen is reported as NON_ASCII with a suggestion.

Tip for the live round: tell the AI which file, the exact behaviour you want, and ask it to add a test. Read its diff before accepting; run test, lint, build.
