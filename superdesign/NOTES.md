# Charge (superdesign)

Built from the superdesign skill's written guidance only: its Brand New Project SOP (write a design system first, then design strictly inside it), the logo invariant (the real HG mark goes in every logo spot) and the shared header/footer component rule. Its CLI and the superdesign.dev service were not used. The system it produced is `design-system.md`. Where the skill and the professor's rules disagree, the professor wins.

Open `index.html` by double-clicking. No build step, no server.

## Pages
`index.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`. All of them share one `style.css` and one `app.js`, and they have the same header and footer. `aria-current` plus a red bar marks the current page, and Reserve lights up Tools.

## The one idea
**Stock shown as battery charge.** Hygears builds electric cars, so every "how many are in" is a small battery: one cell per unit, filled cells are on the shelf, empty cells are borrowed. The count is always written next to it ("2 of 3 available"), so shape and colour never carry the meaning alone. The same cells appear on Home, the catalog, the Reserve summary, the officer stock list, the "How borrowing works" steps and the Track progress bar.

## Palette (brief update 2026-11-23)
White #FFFFFF, cool gray #F4F5F7, lines #D5D8DE, near-black text #14161A, muted text #5B6270 (6.1:1). Hygears red #D7261E is used for buttons and the current-page bar only (hover #B51E17). Charcoal #1B1D22 is used for the hero and footer bands. No cream, orange or amber.

## Fonts
Barlow Semi Condensed 700 for headings, Barlow 400/600 for body. They load from Google Fonts with an Arial fallback, so the pages still work offline.

## For the PHP rebuild
- The header and footer blocks are commented as `header.php` / `footer.php`.
- Item cards are one repeated `<li class="item">` with `data-name/category/type/available`, ready for a PHP loop. The battery is one `<i>` per unit, with `class="on"` when it's in.
- The sample data in `app.js`: the reference number (use the MySQL insert ID), the three Track samples, and the officer login (use `password_verify`).

## Still needs real material
- Item photos (the "Photo slot" boxes) and the real inventory and counts. Everything shown is labelled sample data.
- Announcement dates and venues, and the pubmat images (marked as slots).
- Final borrowing rules (marked Draft on About), the workshop room and pickup hours, and whether a PUP ID is needed at pickup.

See `QA.md` for the visitor run-through and the fixes made.
