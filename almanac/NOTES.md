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
`index.html`, `tools.html`, `reserve.html` (Tools stays highlighted), `track.html`, `join.html`, `about.html`, `officer.html`. One `style.css`, one `app.js`, the same header (with a search box that sends `?q=` to Tools) and footer on every page.

States in `app.js`:
- Catalog search, category and type filters, with an empty state.
- Reserve: validation (student number format, quantity against stock, dates), consumables switch off the return date, success panel with a reference number like `HYG-2026-0142`.
- Track: Pending, Approved, Declined, plus not-found and bad-format errors. The request just made in this browser tracks as Pending.
- Join: validation including the preferred committee.
- Officer: sign-in, counts that link to each table, Approve, Decline and Undo with live counts and an empty state.

Every form says plainly that the prototype sends nothing.

## Still needs real material
1. **Inventory:** the real item list, categories, counts and one photo per item (dashed "photo" squares on Tools). All counts are sample and labelled.
2. **Current logo:** `../assets/hygears-logo.png` is the older red mark; a white version would suit the charcoal footer.
3. **Announcements:** the three notices on Home are samples.
4. **Late-return policy:** open slot on `reserve.html` and `about.html`.
5. **Workshop room** for pickups: open slot on `about.html`.
6. **Real endpoints:** reserve, join, track and officer sign-in need the PHP + MySQL backend.
