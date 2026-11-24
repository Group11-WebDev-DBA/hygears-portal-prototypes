# Ink: the lending desk

**The idea that makes it memorable:** the reservation slip. A ruled gray well with a near-black top edge and the reference number in mono (`HYG-2026-0142`) shows up on every page that does something: the reservation counter in the home hero, the reserve success on Tools, the result on Track request, the application on Join and the sign-in on the Officer desk. Everything else is a plain catalogue printed in black on white, with hairline rules and one red that means "act here".

Open `index.html` by double-clicking. No build step, no server.

## Update 2026-11-23
- **Palette** moved off cream and amber to the classic Hygears red and white (see below). The slip's amber edge is now near-black.
- **Code** flattened so the group can rebuild it from class: `tokens.css` and `base.css` are gone, everything is in one commented `style.css` with hex variables, Flexbox, simple Grid and mobile-first `min-width` media queries. No oklch, clamp(), :has(), svh or lh units. `app.js` is plain functions, `for` loops and event listeners. The Hallmark stamp comments and the `hallmarkSlots` photo script were removed.
- `[hidden] { display: none !important; }` is at the top of the stylesheet.
- QA run and fixes: see `QA.md`.

## Palette

| Role | Value | Where |
|---|---|---|
| Background | white `#FFFFFF` | every page |
| Bands and slips | cool gray `#F4F5F7`, tags `#E8EAEE`, rules `#D9DCE1` | section bands, the slip, current nav item |
| Text | near-black `#14161A` | headings and body (18:1) |
| Secondary | `#5B6270` | hints, captions (6.1:1 on white, 5.6:1 on gray) |
| **Accent** | Hygears red `#D7261E`, hover `#B51E17` | filled buttons, focus ring, current-page underline only (white text 5.0:1) |
| Footer band | charcoal `#1B1D22` | footer, white text |
| Errors | `#B51E17` | error messages, always with words |

Status never relies on colour: every tag has a word and an icon (Available, None left, Pending, Approved, Declined).

## Fonts
- **Epilogue** 700 for headings, 400/600 for body (Google Fonts, falls back to Arial offline).
- **IBM Plex Mono** only for reference numbers, student numbers and stock counts.
- One scale on every page: h1 36px phone / 48px laptop, h2 28 / 36, h3 20 / 24. Body 16px at 1.55.

## Pages
`index.html`, `news.html`, `article.html`, `tools.html` (catalogue with search, category and type filters, plus the Reserve form), `track.html`, `join.html`, `about.html`, `officer.html`. One `style.css`, one `app.js`. Header and footer are identical on every page (ready to become `header.php` and `footer.php`), and the current page is marked in the nav.

States built in `app.js`:
- **Tools:** live filter with a "no match" state. Reserve on a row picks the item and jumps to the form. Messages on every field. Consumables switch off the return date. Success shows a slip with a reference number, saved in this browser so Track request finds it.
- **Track:** Pending, Approved and Declined samples (`HYG-2026-0142`, `0137`, `0129`), a wrong-format error and a not-found state.
- **Join:** validation and the preferred committee select.
- **Officer:** a sign-in card (any email and password, marked as prototype). Counts link to their tables. Approve, decline, accept and mark returned all have Undo, and each table shows an empty state when nothing is left. Days late are counted from today.

Every success state says plainly that the prototype sent nothing.

## News feature (2026-11-24)
Officers post competitions, progress reports, workshops and announcements from the site (see `../FEATURE-NEWS.md`).
- **`news.html`**: published posts, newest first, with a Show filter (Competition, Progress report, Workshop, Announcement, Recruitment) made from the same segmented buttons as the Tools Type filter. Each post hangs from a black rule like the catalogue rows: cover photo (or a dashed slot on wider screens), category tag, date, title, summary, Read more.
- **`article.html?id=N`**: one readable column (18px, about 68 characters a line): category, date, title, cover, paragraphs with inline photos and captions, "Caption by", Back to News and three More posts. No id opens the newest post; a wrong or unpublished id says the post is not available.
- **Home**: "Latest from Hygears" (the 3 newest posts) replaced the old sample notices. The hero links are Browse the catalogue and Read the news; Join moved to a quiet "Membership and ASCEND" button. (Ink never had merch.)
- **Join**: an "Applications open" tag with the ASCEND line. `join.html?season=closed` previews the closed state: the form is hidden and the page says "Follow us for the next ASCEND" with Facebook, Instagram and News.
- **Officer desk**: a New post button in the bar and a Posts section: a table with Edit and Unpublish/Publish, and the New post form in a slip (title, category, date, cover photo with a FileReader preview and Remove photo, photo description, summary, body where blank lines make paragraphs, caption writer, Publish / Save draft). JPG, PNG or WebP up to 2 MB.
- **How it works here**: five sample posts sit in `SAMPLE_POSTS` in `app.js`. The first save copies the list into `localStorage` (`hyg-posts`), so news.html, article.html and Home show the officer's posts in the same browser. Clear the site data to get the samples back.

### How it maps to the real build
`posts` table: `post_id`, `title`, `category`, `summary`, `body`, `cover_image` (file name), `cover_alt`, `caption_by`, `status` (`draft`/`published`), `published_at`, `created_by` (officer). The JS object keys match these columns (`id`, `date`, `cover`, `coverAlt`, `captionBy` stand for `post_id`, `published_at`, `cover_image`, `cover_alt`, `caption_by`).
- news.html: `SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC`, then a `while` loop that prints the same markup as `postCard()`. The filter becomes `?cat=Workshop` and `AND category = ?`.
- article.html: `SELECT * FROM posts WHERE post_id = ? AND status = 'published'`; split `body` on blank lines into paragraphs.
- Home strip: the same query with `LIMIT 3`.
- Officer form: `INSERT` (new) or `UPDATE ... WHERE post_id = ?` (edit) with prepared statements; Unpublish is `UPDATE posts SET status = 'draft' WHERE post_id = ?`. The photo comes in through `$_FILES`, is checked for type and size again on the server, and `move_uploaded_file()` saves it in `uploads/`; only the file name goes in `cover_image`. Print every field with `htmlspecialchars()` (the JS uses `escapeHtml()` for the same job).

## Still needs real material
1. **Current logo.** `../assets/hygears-logo.png` is the older red mark. A white version of the mark would suit the charcoal footer.
2. **Item photos.** 12 dashed "Photo to come" boxes on Tools (72px squares). Replace each with a plain `<img>`.
3. **The real inventory.** Item names, categories and counts are sample.
4. **Pickup room.** Track request has a dashed slot reading "pickup room to be confirmed".
5. **Borrowing rules.** About shows draft rules for the officers to confirm.
6. **News.** The five posts and their dates are sample text written from the Hygears Facebook page; the real posts, photos and caption writers come from the officers.
7. **Fonts offline.** Self-host the woff2 files if the demo might be offline.
