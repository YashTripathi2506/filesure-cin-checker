# Design decisions

- **Client-only.** Parsing is cheap and the privacy story is simple: nothing pasted leaves the device.
- **Three statuses, not two.** *Valid*, *Invalid* (structure wrong) and *Needs review* (structure fine, a code not in our data). This avoids calling a possibly real CIN "invalid" because our reference table is incomplete.
- **Normalisation policy.** Auto-applied and always reported: trim surrounding whitespace, uppercase ASCII letters. Never auto-applied: internal spaces, missing hyphens, look-alike Unicode, dashes. Those are invalid with a *suggestion* only.
- **All errors, not the first.** Character problems are reported first and suppress positional errors (positions are meaningless for a 22-character or Cyrillic string).
- **Duplicates are kept**, labelled "Duplicate of row N".
- **Kind detection.** A hyphen or 8 characters or fewer means "LLPIN attempt"; otherwise "CIN attempt". This only chooses which messages to show.
- **Layout.** One column: heading, input, results. Textarea is visible without scrolling on a laptop. Summary tiles double as filters.
- **Mobile.** Table rows turn into labelled cards with CSS (`data-label`), so the page never scrolls sideways.
- **Colour.** Neutral grey/white, one blue accent; green/red/amber only for status, always with an icon and a word.
- **Why no FileSure brand colours.** Their homepage returned text only in this session, so no colours were observed. Only restraint is claimed, not brand matching.
- **Pagination.** 50 rows per page; validating 500 lines takes a few milliseconds, rendering is the cost.
- **PDF, not CSV.** The report is built in the browser with jsPDF (loaded only when you click Download PDF). Characters the PDF font cannot print are shown as `<U+0410>`. Copy-to-spreadsheet text neutralises formulas (leading apostrophe on `= + - @`).
