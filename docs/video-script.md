# Video script (target 8:30; hard limit 10:00; screen + face + voice)

Say these in your own words. Only claim what you have actually seen working on your screen.

- **00:00-00:30 Intro.** Name, the task (CIN/LLPIN checker for FileSure), that it is an independent assignment.
- **00:30-02:30 Demo.** Click "Try sample data". Show tiles, filters, search, one expanded breakdown, an LLP row ("Not encoded in LLPIN"), PDF download (open the file and show it), copy.
- **02:30-03:30 Invalid and mixed.** Paste: a 20-character CIN, `AAA1234`, an unknown state. Point to full messages, the suggestion, the "Needs review" status and why it exists.
- **03:30-04:15 500 lines.** Paste a 500-line list (generate with the same pattern as the test). Show speed and paging.
- **04:15-05:15 Mobile + design decision.** Browser device mode at 375px: cards instead of a table. Design decision you are proud of: the three-status model / honest "Not encoded in LLPIN".
- **05:15-06:45 Code.** `lib/` vs `components/`; `validateCIN` slicing; regexes; data tables with an evidence basis.
- **06:45-08:00 A genuine AI mistake.** Use one from `docs/verification-log.md` that you re-checked yourself: e.g. the Uttarakhand code (UK expected, real CINs use UR/UT), or the TypeScript error that Vitest missed but `npm run build` caught. Show the evidence on screen.
- **08:00-08:45 Testing + limits.** Run `npm run test`. State limits: format only, reference-level mappings, no MCA lookup.
