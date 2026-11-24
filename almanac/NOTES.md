# Almanac: the printed record

A research organization's reference book: ruled tables on gray printed sheets, numbers lined up in columns, two rule weights (1px hairline, 2px bar), square corners and a serif for reading. The authority comes from the rules and the numbers, not decoration.

## The one idea
**The tool desk is the hero.** The home page opens on what students come for: a ruled ledger of items and how many are available now, with Reserve beside each row. The same sheet carries the catalog, the track lookup and the officer desk, so the whole portal reads as one record.

## Update 2026-11-23
- **Palette** moved off cream, brown-black and amber to the classic Hygears red and white (below).
- **Fonts** cut from three to two: IBM Plex Mono is gone, numbers use Hanken Grotesk with same-width digits.
- **Code** flattened so the group can rebuild it from class: `tokens.css` and `base.css` are gone, everything is in one commented `style.css` with hex variables, Flexbox, simple Grid and mobile-first `min-width` media queries. No oklch, color-mix, clamp(), :has(), dvh or lh units. `app.js` is plain functions, loops and event listeners. The `<template>` icons, the Hallmark stamp comments and the `hallmarkSlots` photo script were removed.
- `[hidden] { display: none !important; }` is at the top of the stylesheet.
- QA run and fixes: see `QA.md`.

## Palette

| Role | Value | Where |
|---|---|---|
| Page | white `#FFFFFF` | every page |
| Sheet | cool gray `#F4F5F7`, hover `#E8EAEE`, hairlines `#D9DCE1` | tables, forms, result panels |
| Text and bars | near-black `#14161A` | body, headings, 2px rules (18:1) |
| Secondary | `#5B6270` | hints, captions, table heads (6.1:1 on white, 5.6:1 on the sheet) |
| **Accent** | Hygears red `#D7261E`, hover `#B51E17` | primary buttons, current-page underline, focus ring only (white text 5.0:1) |
| Footer band | charcoal `#1B1D22` | footer mast, white text |
| Errors | `#B51E17` | error text and the declined/late status icon, always with words |

## Fonts
- **Hanken Grotesk** 500/600 for headings, buttons and numbers.
- **Newsreader** 400/500 for body, labels and table text (17px body, the serif reads small at 16px).
- Google Fonts; offline they fall back to Arial and Georgia.

## Pages
`index.html`, `news.html`, `article.html`, `tools.html`, `reserve.html` (Tools stays highlighted), `track.html`, `join.html`, `about.html`, `officer.html`. One `style.css`, one `app.js`, the same header (with a search box that sends `?q=` to Tools) and footer on every page.

States in `app.js`:
- Catalog search, category and type filters, with an empty state.
- Reserve: validation (student number format, quantity against stock, dates), consumables switch off the return date, success panel with a reference number like `HYG-2026-0142`.
- Track: Pending, Approved, Declined, plus not-found and bad-format errors. The request just made in this browser tracks as Pending.
- Join: validation including the preferred committee.
- Officer: sign-in, counts that link to each table, Approve, Decline and Undo with live counts and an empty state.

Every form says plainly that the prototype sends nothing.

## News feature (2026-11-24)
Officers post competitions, progress reports, workshops and announcements from the site (see `../FEATURE-NEWS.md`).
- **`news.html`**: published posts, newest first, as ruled rows like the notices (2px bar on top, 1px between): framed photo (or a dashed slot from 640px up), category label, date, title, summary, Read more. Phone: photo on top; wider: photo left, text right. The Show filter reuses the joined segmented buttons from Tools.
- **`article.html?id=N`**: one serif column (18px, about 66 characters a line): category, date, title, framed cover, paragraphs with inline photos and captions, "Caption by", Back to News, and More posts in the same rows. No id opens the newest post; a wrong or unpublished id says the post is not available.
- **Home**: "Latest from Hygears" (the 3 newest posts) replaced the sample notices. The hero's second button is now Read the news; Join keeps its own section further down. (Almanac never had merch.)
- **Join**: an "Applications open" line with the ASCEND note. `join.html?season=closed` previews the closed state: the form section hides and a panel says "Follow us for the next ASCEND" with Facebook, Instagram and News.
- **Officer dashboard**: a fifth count, Published posts, linking to a Posts sheet: a table with Edit and Unpublish/Publish, and the New post form (title, category, date, cover photo with a FileReader preview and Remove photo, photo description, summary, body where blank lines make paragraphs, caption writer, Publish / Save draft). JPG, PNG or WebP up to 2 MB.
- **How it works here**: five sample posts sit in `SAMPLE_POSTS` in `app.js`. The first save copies the list into `localStorage` (`hyg-posts`), so news, article and Home show the officer's posts in the same browser. Clear the site data to get the samples back.

### How it maps to the real build
`posts` table: `post_id`, `title`, `category`, `summary`, `body`, `cover_image` (file name), `cover_alt`, `caption_by`, `status` (`draft`/`published`), `published_at`, `created_by` (officer). The JS object keys match these columns (`id`, `date`, `cover`, `coverAlt`, `captionBy` stand for `post_id`, `published_at`, `cover_image`, `cover_alt`, `caption_by`).
- news.html: `SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC`, then a `while` loop that prints the same markup as `postCard()`. The filter becomes `?cat=Workshop` and `AND category = ?`.
- article.html: `SELECT * FROM posts WHERE post_id = ? AND status = 'published'`; split `body` on blank lines into paragraphs.
- Home strip: the same query with `LIMIT 3`.
- Officer form: `INSERT` (new) or `UPDATE ... WHERE post_id = ?` (edit) with prepared statements; Unpublish is `UPDATE posts SET status = 'draft' WHERE post_id = ?`. The photo comes in through `$_FILES`, is checked for type and size again on the server, and `move_uploaded_file()` saves it in `uploads/`; only the file name goes in `cover_image`. Print every field with `htmlspecialchars()` (the JS uses `escapeHtml()` for the same job).

## Still needs real material
1. **Inventory:** the real item list, categories, counts and one photo per item (dashed "photo" squares on Tools). All counts are sample and labelled.
2. **Current logo:** `../assets/hygears-logo.png` is the older red mark; a white version would suit the charcoal footer.
3. **News:** the five posts and their dates are sample text written from the Hygears Facebook page; real posts, photos and caption writers come from the officers.
4. **Late-return policy:** open slot on `reserve.html` and `about.html`.
5. **Workshop room** for pickups: open slot on `about.html`.
6. **Real endpoints:** reserve, join, track and officer sign-in need the PHP + MySQL backend.
