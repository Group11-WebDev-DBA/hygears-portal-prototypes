# Spec: every state accounted for

Built to Vercel's Web Interface Guidelines (bundled snapshot, reviewed against the built files; see QA.md). The look is calm and exact. The strength is interface correctness: forms that tell you what's wrong and jump to it, visible focus, 44px targets, states for loading/empty/error/success, and URLs that remember what you were looking at.

Open `index.html` by double-clicking. No build step, no server. To see the officer dashboard without signing in, open `officer.html?view=dashboard`. Try `track.html?ref=HYG-2026-0139`.

## The memorable idea

**The request timeline.** A reservation's whole life (Submitted, Officer Review, Pick Up, Return) is one four-step track. It previews on Reserve ("What happens next"), fills in on the success screen, shows Pending / Approved / Declined on Track (Declined stops at the review step and shows the officer's reason), and the officer's Approve or Decline-with-reason is what moves it. Students always know where their request is and what comes next.

## Palette (UPDATE 2026-11-23)

| Role | Hex | Use |
|---|---|---|
| Background | `#FFFFFF` | pages |
| Surface | `#F4F5F7` | bands, panels, photo slots |
| Text | `#14161A` | all body text, 16:1 |
| Muted | `#5B6270` | hints, meta, 6.1:1 on white, 5.6:1 on surface |
| Lines / field borders | `#DDE0E5` / `#7D8490` | hairlines (decorative) / inputs (3.8:1) |
| Action | `#D7261E`, hover `#B51E17` | buttons, current-page bar only. White text 5.0:1 |
| Dark band | `#1B1D22`, text `#C9CDD3` | footer with the HG mark |
| Status | ok `#1E7B3C`, bad `#B51E17` | always with an icon and a word |

No cream, beige, amber or orange.

## Fonts

- **Geist** (text, 400/600) and **Geist Mono** (reference numbers, counts, small labels), from Google Fonts with `display=swap`. Offline they fall back to the system UI and monospace fonts.
- Body 16px / 1.5. h1 2rem → 2.75rem, h2 1.5rem → 1.875rem, h3 1.125rem → 1.25rem at 768px, the same on every page.

## Files

`index.html`, `news.html`, `article.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`, one `style.css` (sections numbered, tokens in `:root`, mobile first with breakpoints at 48rem and 64rem), one `app.js` (11 commented sections, plain functions). Photos come from `../assets/`.

For the PHP rebuild: the header/footer blocks are marked `header.php` / `footer.php`. Item cards and table rows are plain repeated markup for a PHP loop. Form `name`s use the planned column names. The sample bits in `app.js` (the reference number, `REQUESTS`, sign-in) are where MySQL and sessions plug in.

## What still needs real material

- The real inventory: item names, categories, counts and photos. All 12 items and counts are samples.
- Borrowing rules: longest borrowing period, the late/damage policy, review time and pickup place (dashed "from officers" slots on About and Reserve).
- The real reference-number format, if it differs from `HYG-2026-0142`, and the real decline reasons.
- Confirmation that the student number format `2024-01234-MN-0` matches PUP IDs (it's used as the example and the validation pattern).
- The current orange-red version of the HG mark, if they want it instead of the older red one.

## News (added 2026-11-24)

Hygears posts all year, but recruitment and borrowing are seasonal, so the portal now has News. `news.html` lists posts newest first with a category filter (Competition, Progress report, Workshop, Announcement, Recruitment). `article.html?id=N` shows one post: category and date, title, cover, 18px body with inline photos and captions, "Caption by", Back to News and More Posts. Home shows the 3 newest as "Latest from Hygears" (replacing the three Announcements slots). Join shows Applications open / closed (`APPLICATIONS_OPEN` in app.js; preview the closed state with `join.html?applications=closed`). The officer dashboard has a **Posts** section: a list with Edit / Unpublish, and a New Post form (title, category, date, cover photo with preview, photo description, summary, body, caption by, Save Draft / Publish).

Try it: open `officer.html?view=dashboard`, Write a New Post, Publish, then open `news.html` in the same browser. Posts are kept in localStorage under `hygears-spec-posts` (clear it to get the samples back).

How it maps to the real build:
- `posts` table: `post_id, title, category, summary, body, cover_image, cover_alt, caption_by, status ('draft'/'published'), published_at, created_by`. Cover files go in `uploads/`.
- `news.html` = `SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC` (add `AND category = ?` for the filter, `LIMIT 3` for Home). `article.html` = `... WHERE post_id = ? AND status = 'published'`.
- The officer form = INSERT/UPDATE with prepared statements. The two submit buttons send `action=publish|draft`. FileReader is only the preview: PHP checks the type and size again and saves the file with `move_uploaded_file`.
- The samples' inline article photos (`photos`) would be a small `post_photos` table, or left out of v1.

Still needs real material: the text, dates and photos for all five sample posts (each is marked Sample and written only from the Facebook page facts), and the real recruitment season for the open/closed switch.
