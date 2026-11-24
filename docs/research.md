# CIN and LLPIN research

Research done for this assignment. Every mapping in `src/data/` traces back to a row here.
**Honesty note:** I could not reach an MCA page that publishes the complete code tables. Most mappings rest on
(a) real CINs/LLPINs printed in public filings and registry pages, and (b) several consistent published guides.
Anything weaker than that is marked *reference* or *unverified*.

## 1. Three different questions
1. **Structural validity**: does the text follow the layout? (Fully checkable offline.)
2. **Recognition**: do the codes inside map to a known meaning in our reference data? (Partly checkable.)
3. **MCA verification**: does the company actually exist, and is it active? (**Not possible here.** Needs MCA data.)

This tool does 1 and 2 only. A valid format never proves a company exists.

## 2. CIN layout (21 characters)

| Chars | Example | Meaning | Rule used | Evidence |
|---|---|---|---|---|
| 1 | `L` | Listing status | `L` listed, `U` unlisted | Razorpay, Cashfree, Tata Capital, ClearTax guides all agree; every real CIN sampled starts with L or U |
| 2-6 | `17110` | Industry code | 5 digits | Guides agree. Real CIN with `99999` seen (Uttam Sugar Mills filing) so digits-only, any value |
| 7-8 | `MH` | State/UT | 2 letters, see §3 | See §3 |
| 9-12 | `1973` | Year | 4 digits, not in the future | Guides agree |
| 13-15 | `PLC` | Company type | 3 letters, see §4 | See §4 |
| 16-21 | `019786` | Registration number | 6 digits | Guides agree |

Total: 1 + 5 + 2 + 4 + 3 + 6 = 21. The segmentation proposed in the brief was verified against the guides and
real CINs; it is correct.

Not checked: the industry code is displayed as-is. I did not find an authoritative mapping from codes to names,
so none is shown.

## 3. State codes
- **Evidenced in a real CIN or MCA notice:** MH (assignment example), KA (`L01631KA2010PTC096843`, ClearTax guide; `U72900KA2021PTC152480` registry page),
  DL (`U70102DL2014PTC262991`, registry page), CT (`L15141CT1987PLC003777`, NSE filing),
  TG (`L72200TG1996PLC024351`, BSE filing; plus MCA notice archive: Telangana code changed from AP to TG),
  UR (`L15133UR1990PLC023970` BSE filing; `U45309UR2017SGC007687` registry),
  UT (`U68100UT2023PTC015354`, `U42209UT2023SGC016310`, registry pages).
- **Reference level:** all remaining states/UTs in `stateCodes.ts` use the standard two-letter codes
  (ISO 3166-2:IN and vehicle-style) that the ROC convention follows. Not individually sampled from a real CIN.
- **Uttarakhand has two codes in real CINs: UR (older) and UT (newer).** ISO/road-transport lists give UK, but no real CIN seen used UK, so UK is **not** accepted.
- **Telangana:** a CIN with TG can have an incorporation year before 2014 (the 1996 example). So there is no "state vs. year" consistency rule.
- **Deliberately not included (unverified):** LA (Ladakh), DH, OD, UK, TS. These give a *Needs review* result.
- DD and DN are included as historical codes (merged 2020). Whether newer CINs use a different code is **unverified**.
- Do not confuse with GST alpha codes (one GST list shows Telangana as `TL`). CINs use `TG`.

## 4. Company type codes
- **Evidenced in real CINs:** PLC, PTC, SGC (`U45309UR2017SGC007687`), NPL (`U85300UR2020NPL011532`).
- **Reference level** (named consistently by multiple guides): OPC, GOI, FTC, GAP, GAT, ULL, ULT.
- The guides word ULL/ULT slightly differently ("unlimited liability, public/private"). The app shows a cautious description.
- **Unverified / not included:** FLC and any other code. They give *Needs review*.
- Government company codes in the tests are GOI and SGC only; I found no source for others.

## 5. LLPIN
- Format `AAA-1234`: three letters, hyphen, four digits (7 characters). Agreed by registerkaro, IndiaFilings, Razorpay, RestTheCase, Infyner and the brief.
- Real LLPINs seen in registry listings: `ABB-3106`, `ACS-6357`, `AAQ-4645`, `ABZ-4460`, `ABB-2739`.
- **Conflicting source rejected:** taxclue.in claims the format is `AA-NNNNNN` with a state code. This contradicts every other source and every real LLPIN seen. Not used.
- The prefix is allotted sequentially and carries no meaning (Infyner, RestTheCase). So state, year and listing status are shown as **"Not encoded in LLPIN"**.
- Unverified: whether any letters are excluded from the prefix; foreign LLP (FLLPIN) and foreign company (FCRN) formats. Out of scope.

## 6. Year bounds
Future years are rejected (simple logic). Years before 1850 are flagged **Needs review**: 1850 is a reasoned bound
(first Indian company law), **not an MCA rule**.

## 7. Sources
- MCA notices archive (AP to TG change): https://www.mca.gov.in/MinistryV2/noticearchieve.html
- MCA Registrars of Companies: https://www.mca.gov.in/MinistryV2/registrarofcompanies.html
- MCA Form 3 (LLP) FAQ lists LLPIN/CIN/FCRN/FLLPIN as separate identifiers: https://www.mca.gov.in:443/Ministry/pdf/Revised-Filing-Steps-and-FAQs-of-Form-3-LLP-20230607.pdf
- Guides: razorpay.com/rize/blogs/corporate-identification-number, cashfree.com/blog/corporate-identification-number-cin, tatacapital.com/blog/loan-for-business/what-is-cin-number, cleartax.in/s/cin-corporate-identification-number
- LLPIN: registerkaro.in/post/llp-identification-number, indiafilings.com/llp-registration/registration-number, infyner.com/research/what-is-llpin
- Real CIN samples: BSE/NSE filings (Flex Foods, Deccan Healthcare, KN Agri), ZaubaCorp registry pages.
- FileSure's homepage (filesure.in) was fetched but returned text only; no colours or typography could be observed.
