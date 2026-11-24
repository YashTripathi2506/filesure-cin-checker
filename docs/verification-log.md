# Verification log

Only real incidents are recorded. Nothing here was staged. Dates: 24 Nov 2026 session.

## 1. Uttarakhand state code: ISO lists vs real CINs
- **AI assumption:** Uttarakhand's CIN code would follow the standard lists (ISO / road transport) and be `UK` (some lists show `UT`).
- **Why doubtful:** the ISO article itself notes the code differs from other schemes, and CINs use a ROC convention, not ISO.
- **Check:** searched for real CINs of Uttarakhand companies.
- **Evidence:** `L15133UR1990PLC023970` (BSE), `U45309UR2017SGC007687`, `U40100UR2003PLC033442` use **UR**; `U68100UT2023PTC015354` uses **UT**. No real CIN with UK found.
- **Correction:** accept UR and UT with notes; exclude UK. `stateCodes.ts`, tested in `validation.test.ts`.
- **Result:** tests pass.

## 2. LLPIN format conflict between sources
- **Issue:** one site (taxclue.in) describes the LLPIN as `AA-NNNNNN` with a state code. Other sources say `AAA-NNNN`.
- **Check:** compared with six other sources and with real LLPINs in registry listings (`ABB-3106`, `ACS-6357`, ...).
- **Correction:** kept `AAA-NNNN`; rejected the outlier. Recorded in `research.md` §5.
- **Result:** consistent with all real examples found.

## 3. A "TG means 2014 or later" rule would have been wrong
- **Considered (design stage, never shipped):** reject states whose code did not yet exist in the incorporation year.
- **Check:** MCA notice says Telangana companies' codes changed AP to TG; a real filing shows `L72200TG1996PLC024351`.
- **Result:** no state-vs-year rule. A test asserts TG with year 1996 is accepted.

## 4. TypeScript error in the first build
- **AI-generated code:** `parseAndValidate` read `outcome.cin` where `outcome` could be an LLPIN result type with no `cin` field.
- **Detection:** `npm run build` (`tsc --noEmit`) failed: `Property 'cin' does not exist on type 'LlpOutcome'` (parseIdentifiers.ts line 79).
- **Correction:** typed `outcome` as the shared `CinOutcome`.
- **Result:** build, lint and tests pass. (Vitest alone had passed, because it does not type-check. Lesson: run all three commands.)

## 5. Things I could NOT verify (so they are not claimed)
- No real browser was available in the build environment, so viewport tests (320-1440px) and visual checks were **not run** by me. Do them yourself (see README checklist).
- Reference-level state and type mappings (research.md §3-4).
- The full list of MCA company-type codes.

## Note on test results
All tests passed on the first run (58, later 60). That does not prove correctness: tests were written from the format rules, but those rules
are only as good as the research above. **Please independently verify at least a few mappings yourself (e.g. look up 3 real companies on MCA) and record anything you find here.**
