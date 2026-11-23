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
