# QA: Taste ("the ticket"), after the 2026-11-23 palette and code update

Run with QA-PROTOCOL.md on 2026-11-23. Screens checked: index (phone 390 full page, laptop 1280), tools (phone), reserve (phone 360), track with the Approved sample (phone), officer dashboard after sign-in (phone), plus the code of style.css, app.js and every page.

## 1. Mika (2nd-year ME, budget Android, one thumb)
"Home: the red Reserve a tool button is right there, full width. Tools: search, category, Tools/Consumables all big enough for my thumb. Soldering station says Available now: 2 units, Reserve goes straight to the form with the item picked. The form is one column with hints over each box. Ticket at the end with the number. Doable in about a minute. The catalog cards are tall because of the big empty photo slots, so I scroll a lot to reach the soldering station."
- Minor: tall photo slots on phone make the catalog long (only 2 items per screen).
- Minor: the home "three steps" mini cards wrap "Digital multimeter" onto two lines at 390px.

## 2. Paolo (officer, phone then laptop)
"Signed in, the four counts are at the top, pending requests are cards with Approve and Decline side by side, the cell turns into an Approved badge. Overdue is right after pending. On the phone the stock list is 12 cards long before I get to new applications."
- Minor: on phones, New applications sits below the 12-row stock list. Order on the page is pending, overdue, stock, applications.
- Minor: after sign-in the "Today's queue" heading showed a red focus box (programmatic focus).

## 3. Bea (1st-year from the ASCEND post)
"White and red with the HG logo, it looks like the classic Hygears page, not like the cream recruitment art, but that's fine. The footer now has the 'Engineering Innovation • Research • Technology • Leadership' line and the hashtag. Join Hygears is the second button in the hero and in the menu."
- Fixed before QA: the standing sign-off and the HG mark were missing from the footer; added with the charcoal band.
- Minor: Join is a secondary (outlined) button on the home page, so recruitment is quieter than reservations. Kept on purpose: reserving is the main task.

## 4. Senior UI/UX designer
"The photo-led split hero still carries it, and the gray ticket stub with the dashed tear line is a clearer object than before. Palette is calm: red only on actions, the nav marker and Sent/Publish pills. Charcoal footer gives the page an end. Weakest screen: the laptop 'three steps' cards, where the drawn UI panels overflowed their fixed 236px height."
- Major: index, laptop, #borrow cards: the first card's mini UI spilled above and below its panel (fixed height, no clipping).
- Minor: very large gap between home sections on laptop (each is about one screen tall). That is the direction's rhythm; left.

## 5. Sir Cadaoas (professor, ui-requirements)
- Pass: one primary (red) used for actions, current page and key pills; neutrals white/gray/near-black; no orange or cream left.
- Pass: contrast. Ink 18:1, secondary #5B6270 6.3:1 on white and 5.8:1 on gray, white on red 5.0:1, white on charcoal 16:1, footer gray #B4BAC4 on charcoal about 9:1.
- Pass: two fonts (Host Grotesk + system monospace for reference numbers), body 16px / 1.55, the same h1/h2/h3 variables on every page.
- Pass: one style.css with variables, the same header and footer on all 7 pages, aria-current marks the page (reserve marks Tools).
- Pass: labels, hints and errors on every field; alt text on photos; focus ring; status uses icon + word.
- Minor: Host Grotesk loads from Google Fonts. Offline it falls back to Segoe UI/Arial, so pages still work by double-click.

## 6. Hans (groupmate rebuilding in PHP)
"The CSS reads top to bottom in numbered sections, mobile first then two media queries. Nothing I can't explain: hex variables, flex, a 12-column grid with span-N classes, one keyframe for the hero fade. The ES-module 'moments' and the m-enter script are gone. app.js: the $ / $$ / esc helpers are now commented functions. Still uses arrow functions and template strings, which we did cover. The officer stock badge was a nested ternary, hard to read out loud."
- Major (fixed before QA): advanced CSS removed: clamp() type scale, min(), svh, :has() on the Tools switch (now `input:checked + span`), custom-property grid spans, inset, text-wrap, color via rgba lines, ES module loader.
- Minor: nested ternary in `stockLevel` (officer).
- Minor: `taste/assets/moments/` is still on disk but no page links to it any more (delete it; see After fixes).

## 7. Accessibility tester (keyboard + screen reader)
- Pass: skip link, header/nav/main/footer landmarks, labels tied with aria-describedby to hints and errors, error count in a role="status" line, first bad field gets focus.
- Pass: track result is aria-live; tools count is role="status"; the menu button has aria-expanded and Escape closes it.
- Pass: Tools/Consumables are real radio buttons in a fieldset with a legend; keyboard focus shows a ring inside the selected segment.
- Minor: programmatic-focus targets drew a heavy red ring that looks like an error (see Paolo).

## Fix list (de-duplicated, by severity)
1. Major: laptop "three steps" panels overflow their fixed height (designer).
2. Major (done before QA): remove advanced CSS and the ES-module moment kit; plain CSS fade instead of the m-enter script (Hans).
3. Minor: nested ternary in officer `stockLevel` (Hans).
4. Minor: red ring on headings/result boxes that receive focus from app.js (Paolo, a11y).
5. Minor: catalog photo slots tall on phones (Mika).
6. Minor: officer page order on phones puts applications after the long stock list (Paolo).
7. Minor: unused `assets/moments/` folder (Hans).

## After fixes
- 1: `.card .panel` now uses `min-height: 236px` on laptop instead of a fixed height; re-shot at 1280: all three panels hold their content.
- 3: `stockLevel` is a plain function with `if` / `return` and a comment.
- 4: `[tabindex="-1"]:focus { outline: none; }` (only elements app.js focuses; real controls keep the ring).
- Still open: 5 (needs real item photos, which will change the slot size anyway), 6 (a content-order choice for the group), 7 (`taste/assets/moments/` could not be deleted from this session; delete the folder by hand, nothing references it).
