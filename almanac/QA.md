# Almanac: QA (role-played visits, 2026-11-23)

Run after the palette change (white, cool gray sheets, near-black, Hygears red for actions) and the code flattening (one `style.css`, plain `app.js`). Checked at 390 x 844 and 360 x 800 (phone) and 1280 x 800 (laptop) on index, tools, reserve, track, join and officer (signed out and signed in). About was a quick look. Behaviour was checked by reading the HTML, CSS and JS.

## 1. Mika, 2nd-year ME, budget Android, between classes
"The home page already shows the soldering station with 2 available and a Reserve button. One tap and I'm on the form with it picked. On Tools the rows are tidy: name, category, type, count and Reserve on the right. The student number box only says 'as printed on your ID', so I typed it my way and wasn't sure it was right. Quantity didn't tell me how many I could take."
- Works: Reserve from the home ledger and the catalog prefill the item; 48px fields; per-field errors.
- Fails: student number had no example or format check (reserve, join). **Minor**
- Fails (fixed during the flattening): quantity had no "N available" hint, and the return date stayed active for consumables. **Minor**

## 2. Paolo, officer, phone then laptop
"On my phone the pending cards were a mess: Qty and Return on the left, Pickup and Status on the right, and Approve squeezed into a narrow column so the item name wrapped every two words. On the laptop the table reads well, but the reference numbers sat oddly indented. The counts at the top don't take me anywhere."
- Works: approve, decline and undo with a spoken status message; count updates; empty state.
- Fails: phone table cards placed cells into two random columns. **Major** (also hit the Tools and home ledgers on phone)
- Fails: no jump from the counts to each table. **Major**
- Fails: reference column right-aligned on laptop (it uses the number style). **Minor**
- Fails: the "Today's desk" heading showed a red focus box after sign-in. **Minor**

## 3. Bea, 1st-year from the ASCEND post
"Red and white with the HG mark, that's them. It reads more like an official document than their posts, which is fine for a borrowing site. Apply to join is in the hero and the form lists the five committees from the post. I didn't see their 'Engineering Innovation • Research • Technology • Leadership' line anywhere."
- Fails: standing descriptor line missing. **Minor**

## 4. Senior UI/UX designer
"The printed-record identity survives without the cream: gray sheets with a 2px black top rule, square corners, serif body. Red appears only on the primary buttons and the nav underline, so the one action per screen is obvious. Weakest screen: the phone officer dashboard before the table fix. The catalog's Reserve buttons are outlined while the hero's is red, which is the right hierarchy for a list. The home ledger is the best idea of all the directions: the first screen is the thing students came for."
- No extra issues beyond Paolo's.

## 5. Sir Cadaoas, Web Development professor
- **Fonts:** the old build loaded three families (Hanken Grotesk, Newsreader, IBM Plex Mono). The rule is two. **Major**, fixed during the flattening: Plex Mono is gone and numbers use Hanken Grotesk with same-width digits.
- Palette and accent use: pass. Contrast: body `#14161A` on white 18:1; `#5B6270` on white 6.1:1, on the `#F4F5F7` sheet 5.6:1; white on red 5.0:1; footer text on charcoal 8.6:1 or better.
- Body 17px serif at 1.55, the same h1/h2/h3 on every page, CSS variables, one stylesheet, same header and footer, current page underlined: pass.
- Mobile first: the stylesheet uses `min-width` media queries from a phone base. Pass.
- Labels, hints, errors, alt text, focus states: pass.

## 6. Hans, groupmate rebuilding in PHP
"One CSS file in numbered sections, hex colours, flex and grid. I can explain all of it. The JS is plain functions and loops. The old version used `<template>` tags for icons, which we never covered; now the icons are just strings in a JS object. Things to look up before the defense: `URLSearchParams`, `localStorage`, `closest()`, `dataset` and the `.stack > * + *` selector (it's commented). The header search form already sends `?q=` to tools.html, which is how a PHP search would work."
- Fixed during the flattening: `<template>` icons and the `hallmarkSlots` script removed. No blockers left.

## 7. Keyboard and screen reader
- Skip link, landmarks, labels, `aria-live` errors, `role="status"` on the track result and the dashboard message, focus moved to the confirmation panel: pass.
- Status always has a word and an icon: pass.
- Tool thumbnails are `aria-hidden` but the laptop table still has a "Photo" column header. **Minor**, left as is (the column holds the photo once real images arrive with alt text).

## Fix list (de-duplicated, by severity)
1. **Major** Three font families. (fixed during the flattening)
2. **Major** Phone table cards: cells scattered into two columns (officer, tools, home ledger).
3. **Major** Officer counts don't link to their tables.
4. **Minor** Student number has no example or format check.
5. **Minor** Quantity has no availability hint; return date active for consumables. (fixed during the flattening)
6. **Minor** Reference column right-aligned on laptop.
7. **Minor** Focus box on "Today's desk" after sign-in.
8. **Minor** Standing descriptor line missing.

## After fixes
- 1: Plex Mono removed from the font link; `.num` uses Hanken Grotesk with `font-variant-numeric: tabular-nums`.
- 2: on phones every cell goes in column 1, the action sits beside the item in column 2. The officer pending table (`table--actions-below`) puts Approve and Decline under the details.
- 3: each count is a link to its table (`#pending-table`, `#overdue-table`, `#apps-table`, `#stock-table`), with `scroll-margin-top` so the sticky header doesn't cover it.
- 4: hint "like 2023-00123-MN-0" and a `pattern` on reserve and join.
- 5: quantity hint shows "N available now"; consumables disable the return date.
- 6: first column of every table is left-aligned.
- 7: `[tabindex="-1"]:focus { outline: none; }` (the same rule was added to Ink).
- 8: "Engineering Innovation • Research • Technology • Leadership" is in every footer.

Re-checked officer (signed in, phone and laptop) and tools (360px): all fixed.

**Still open**
- Join success is a single line under the button, with no slip or reference. Enough for a prototype; the real site could show the saved application.
- Officer dates are ISO (`2026-12-01`); fine for officers, but "1 Dec 2026" would match the rest of the site.
- Phone header is about 210px tall (logo, search, two rows of links) and is not sticky on phones on purpose.


---

# News feature (QA run 2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html`, `article.html`, "Latest from Hygears" on Home (in place of the sample notices), the applications open/closed state on Join, a Posts sheet on the Officer dashboard with a fifth count, and News in every header and footer. Checked at 390 x 844 and 360 (phone) and 1280 x 800 (laptop) on news, article (`?id=3`), home, join (`?season=closed`) and officer (signed in, with a photo chosen). The publish flow was run end to end in headless Chrome: empty form, wrong file type, a 3 MB file, a good PNG with preview, missing photo description, publish, unpublish a sample, edit and save, then news, home and article read back in the same browser profile. No page scrolls sideways at 360px.

## 1. A student reading an article on a phone
"It reads like the rest of the site: serif text, a black rule on top of the list, the category in small bold type next to the date. The article text is big enough and the lines are short. The photo has the same thin black frame as the photos on Home. Back to News is at the top and More posts at the bottom."
- Works: 18px serif body at 1.7, max 66ch; Back to News; More posts; "Sample article" marked; posts without a photo skip the empty slot on phones.
- No issues found on the phone.

## 2. Paolo, officer, publishing on phone and laptop
"There's a fifth number at the top now, Published posts, and it jumps to the Posts sheet. The New post form is white inside the gray sheet, the same fields as Reserve. The preview showed up as soon as I picked a photo, and a wrong file or a 3 MB photo got a clear message under the field. On the laptop the Edit and Unpublish buttons stacked on top of each other in every row, so the table was twice as tall as it needed to be."
- Works: preview, type and size checks, required fields with messages, Publish vs Save draft, Unpublish/Publish, the count updates, the status message gets focus, edits say "Saved changes to".
- Fails: Edit and Unpublish stacked in each laptop row. **Minor**

## 3. Bea, from Facebook, looking for news
"News is right after Home. The ASCEND post lists the committees from the recruitment post. The closed Join page tells me to follow them for the next ASCEND and links Facebook and Instagram, so I know where to look."
- Works: News highlighted on news and article; Join open line and closed panel.
- No issues.

## 4. Senior UI/UX designer
"News is the notices list grown up: ruled rows with the 2px bar on top, square framed photos, the joined segmented filter from Tools, the category as a plain sans label rather than a coloured chip. It belongs to the printed-record look. But on the Home page the post list ran off the right edge of the screen on a laptop: long titles pushed the grid wider than the container, the left heading column got squeezed to a few words a line, and the photo columns on News were different widths from row to row."
- Fails: Home "Latest" rows overflow the right edge on laptop, and photo columns change width per row on News. **Major**

## 5. Sir Cadaoas
- Palette: no new colours; the category is a text label, red only on Publish and the nav underline. Pass.
- Two fonts kept (Hanken Grotesk, Newsreader). Same h1/h2/h3. Article body 18px at 1.7. Pass.
- One stylesheet (new section 12), one `app.js`, same header and footer, current page marked. Pass.
- Labels, hints and error text on the New post form; alt text on every photo; officers must describe their photo. Pass.

## 6. Hans, rebuilding it in PHP
"Same as the rest of this direction: plain functions and loops. The post objects use the `posts` column names, the list is one loop, the form names match the columns. I'd need to explain `FileReader`, `JSON.stringify`/`JSON.parse` and `sort()` with a compare function. The `minmax(0, 2fr)` in the CSS is new to me but the comment says why."
- No blockers. **Minor:** those lookups.

## 7. Accessibility
- Filter: fieldset, legend, real radios; count is `aria-live`.
- One heading per post; "Read more" carries the title; list photos have empty alt (the title follows), article photos have full alt.
- Officer: buttons labelled with the post title; `role="status"` message gets focus; Edit moves focus to the form heading; labels, hints and `aria-live` errors on every field; errors clear as you fix them (the existing input listener).
- No issues.

## Fix list (News feature)
1. **Major** Home "Latest" rows overflow on laptop; News photo column width changes per row.
2. **Minor** Officer posts table: Edit and Unpublish stacked on laptop.

## After fixes
- 1: `.post` columns are `minmax(0, 2fr) minmax(0, 5fr)` and `.posts` has `min-width: 0`, so long titles wrap. Re-shot Home and News at 1280: rows stay inside the container and every photo column is the same width.
- 2: `#post-table .actions` doesn't wrap from 640px up. Re-shot: one line per post.

**Still open**
- Browser storage holds about 5 MB, so only a few posts with photos fit; the form says so when it is full. The real site saves files to `uploads/`.
- News, the home strip and the article are drawn by JavaScript; without JS they show a short note. PHP prints them on the server.
- No Delete (the spec asks for Edit and Unpublish). Clearing site data restores the samples.
- Officer dates stay ISO (`2026-11-21`) like the other dashboard tables; the public pages use "21 November 2026".
