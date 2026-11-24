# Route Line (web-design-engineer)

Built with garden-skills' web-design-engineer skill. The brief's simplicity rules win where the skill disagrees: no CDN libraries, no oklch, no clamp(), no container queries, no Tweaks panel. Open `index.html` by double-clicking.

## The one idea
**Every request travels a line.** Borrowing is drawn like a transit line map (Vignelli's subway map, Swiss wayfinding): Reserve online → Officer review → Pick up → Return. The same route component is the "How borrowing works" map on Home, the "you are here" marker on Reserve, the result on Track (Pending stops at stop 2, Approved sits at Pick up, Declined ends the line with an X), the "what happens next" on Join, and both success screens. Filled stop = done, ringed stop = you are here, dashed gray = still ahead. Each stop also says it in words, so state never depends on colour. Horizontal on laptop, vertical on phones. The catalog follows the same signage logic: a departure board with "3 of 4 available" beside each Reserve button.

Not used by the other folders: ink and taste are slips/tickets, almanac is a ledger, frontend-design and impeccable are shadow boards, uiux-pro-max is a pit board.

## Design read
Prototype for PUP students on phones (10cm viewing) and officers on phone + laptop. Information-architecture school, anchor `vignelli-swiss-helvetica`. Visual variance 4, motion 1 (none), density 5, asset dependence 6 (real logo and three real photos), brand fidelity 8.

## Palette (2026-11-23 update)
| Role | Hex |
|---|---|
| Background | `#FFFFFF` |
| Sections, panels | `#F4F5F7` |
| Text | `#14161A` |
| Secondary text | `#5B6270` (6.1:1 on white, 5.6:1 on gray) |
| Borders / upcoming stops | `#D5D8DE` dividers, `#7D8492` inputs (3.8:1) |
| Actions + current-page bar only | `#D7261E`, hover `#B51E17` (white on red 5.0:1) |
| Dark band and footer | `#1B1D22`, soft text `#C4C8D0` |

No orange, amber or cream anywhere outside the logo image.

## Fonts
- **Instrument Sans** 400/500/600/700 for everything (headings and body).
- **JetBrains Mono** 500/700 only for reference numbers, stop numbers and dashboard counts.
Both from Google Fonts via one `<link>`; offline they fall back to Helvetica/Arial and Consolas.

## Files
`index.html`, `news.html`, `article.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`, one `style.css` (tokens in `:root`, numbered commented sections, mobile first with 48em and 64em breakpoints), one `app.js` (plain functions, one section per page, commented). Photos and logo are linked from `../assets/`. `QA.md` has the visitor reviews and fixes.

## How the states work (prototype)
- Tools: search, category, Tools/Consumables chips, Available now only; Reserve links to `reserve.html?item=<slug>`, which pre-selects the item and caps the quantity.
- Reserve: validation (student number format 2024-00123-MN-0, email, dates from today, return after pickup, return date hidden for consumables); success always shows sample `HYG-2026-0142`.
- Track: samples 0142 Pending (with Cancel), 0138 Approved, 0131 Declined; also reads `track.html?ref=`.
- Officer: any email + password opens the sample dashboard (PHP will do real sign-in with `password_verify`). Approve / Decline / Mark returned / Mark reviewed update the row and the counts.

## News (added 2026-11-24)
Hygears posts all year, but recruitment and borrowing are seasonal, so the portal now has News, drawn in the same signage language: ruled rows like the departure board, category in the stop-label style, the Tools chips as the filter.
- `news.html`: newest first, chips for Competition, Progress report, Workshop, Announcement, Recruitment (`news.html?cat=Workshop` opens filtered).
- `article.html?id=N`: category and date, title, cover, 18px body with inline photos and captions, "Caption by", Back to News, More posts. No id shows the newest.
- Home: "Latest from Hygears" is now the 3 newest posts.
- Join: Applications open / closed (`APPLICATIONS_OPEN` in app.js; preview with `join.html?applications=closed`).
- Officer dashboard: **Posts** (table with Edit / Unpublish, "Write a new post", New post form with title, category, date, cover photo with preview, photo description, summary, body, caption by, Save draft / Publish) and a fifth summary count.

Try it: sign in on `officer.html`, Write a new post, Publish, then open `news.html` in the same browser. Posts are kept in localStorage under `hygears-routeline-posts` (clear it to get the samples back).

How it maps to the real build:
- `posts` table: `post_id, title, category, summary, body, cover_image, cover_alt, caption_by, status ('draft'/'published'), published_at, created_by`. Cover files go in `uploads/`.
- `news.html` = `SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC` (`AND category = ?` for a chip, `LIMIT 3` for Home). `article.html` = `... WHERE post_id = ? AND status = 'published'`.
- The officer form = INSERT/UPDATE with prepared statements; the submit buttons send `action=publish|draft`. FileReader is only the preview: PHP checks type and size again and saves with `move_uploaded_file`.
- The samples' inline photos would be a small `post_photos` table, or left out of v1.

Real material still needed for News: text, dates and photos for all five sample posts (each is marked Sample and written only from the Facebook page facts), and the real recruitment season for the open/closed switch.

## Needs real material
- Real item list, counts and photos (all items marked Sample).
- Pickup room, review time, ID requirement, replacement policy; borrowing rules are a marked draft.
- What happens after a membership application is reviewed (their real recruitment uses a Google Form).
- The current orange-red version of the HG mark if they want it; the site uses the provided red one.
