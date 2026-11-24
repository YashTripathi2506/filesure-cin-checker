# Deployment, submission email and compliance checklist

## Deploy
1. `cd filesure-cin-checker`, open in VS Code, run `npm install` then `npm run dev`.
2. `git init && git add . && git commit -m "feat: FileSure CIN checker"`.
3. On github.com create a **public** repo named `filesure-cin-checker` (no README/gitignore). Then:
   `git remote add origin https://github.com/<you>/filesure-cin-checker.git && git branch -M main && git push -u origin main`
4. vercel.com > Add New > Project > import the repo > Deploy (defaults are right).
5. Open the URL on your phone; paste the sample data; check wrapping, tapping, no sideways scroll.
6. Put the URL in README and commit.

## Manual test checklist (I could not run these for you)
Widths 320, 375, 390, 768, 1024, 1440: no horizontal page scroll; buttons >= 44px; Tab through everything; try sample data, empty input, 500 lines, filter with no matches, Clear.

## Email draft
Subject: Tech assignment: CIN checker (Yash Tripathi)

Hello FileSure team,
Please find my assignment below.
- Live link: <URL>
- Repository: <GitHub URL>
- AI transcripts: <share links / exported files, all conversations, unedited>
- Video (<= 10 min): <link>
A note on scope: the tool checks identifier format and decodes the codes; it does not verify companies against MCA. Reference-level mappings and other limits are in docs/research.md.
Thank you,
Yash Tripathi

## Compliance checklist
- [ ] Live link (after you deploy)  - [ ] Public repo  - [ ] ALL AI transcripts, complete and unedited (including the conversation that produced the prompt)
- [ ] Video <= 10 min with screen, face, voice, page working, one design decision, code walk-through, one genuine AI error and how you caught it
- [x] valid/invalid with reasons, company/LLP, listed/unlisted, state, year, type  - [x] empty / wrong / 500-line states
- [ ] Verified on a phone and at the listed widths
