# Ink: QA (role-played visits, 2026-11-23)

Run after the palette change (white, cool gray, near-black, Hygears red for actions) and the code flattening (one `style.css`, plain `app.js`). Checked at 390 x 844 and 360 x 800 (phone) and 1280 x 800 (laptop) on index, tools (and the reserve form), track, join, officer (signed out and signed in). About was a quick look. Behaviour was checked by reading the HTML, CSS and JS.

## 1. Mika, 2nd-year ME, budget Android, between classes
"I typed nothing, just scrolled to the soldering station. It says None left, and next to it 'Back when returned'. Okay, but when? Who do I ask? I'm stuck. I tried the multimeter instead: Reserve took me straight to the form with the item already picked, nice. Nine fields with one thumb is a lot, but they're big and the hints tell me the student number format. The reference number on the slip is big and clear."
- Works: Reserve on a row fills the item and jumps to the form; fields are 48px tall; hints and errors per field; slip shows the reference number.
- Fails: soldering station row is a dead end, no next step (tools.html, "Back when returned"). **Minor**
- Fails (found on the first screenshot pass, fixed before the visit): the Type filter buttons stacked full width and pushed the list off screen. **Major**

## 2. Paolo, officer, phone then laptop
"On my phone every request is a tall card. Four pending ones and I have to scroll forever to reach Overdue. The counts at the top are just numbers, I can't tap them. On the laptop the table is fine but the reference and student numbers break across two lines, which makes them hard to read out."
- Works: approve and decline are one tap with Undo; counts update; empty states.
- Fails: no way to jump to Overdue or Applications on a phone (officer.html, stats row). **Major**
- Fails: `HYG-2026-` / `0142` and student numbers wrap on the laptop table. **Major**
- Fails: on phone cards the "Reference:" label was in the mono font. **Minor**

## 3. Bea, 1st-year from the ASCEND post
"It's red and white like their old logo, so it feels like Hygears, but calmer than the posts. I didn't see 'Engineering Innovation, Research...' anywhere on the home page. Apply to join is right there in the hero and again at the bottom. The form is clear and the committee list matches the post."
- Works: Apply in hero and close; committee select; logo in header and footer.
- Fails: standing descriptor line missing. **Minor**

## 4. Senior UI/UX designer
"The slip idea survives the palette change well: near-black top edge, gray well, mono number. Red is now truly the only colour, and it's only on buttons and the nav marker, which makes the Reserve button pop. The home hero has two quiet buttons next to a red Reserve, which is the right hierarchy. Weakest screen: the officer table on a phone, it's a long label:value list. The desktop nav once showed the Menu button next to the links, which looked broken."
- Fails (fixed before the visit): Menu button visible on desktop (`.btn` rule overrode `.menu-toggle`). **Major**
- Open: phone officer cards are long (see Paolo). **Minor** after the jump links.

## 5. Sir Cadaoas, Web Development professor
- Limited palette, red only for actions and the current-page marker: pass. Error text uses the darker red `#B51E17` with words, which is the usual convention.
- Contrast: body `#14161A` on white 18:1; secondary `#5B6270` on white 6.1:1, on `#F4F5F7` 5.6:1; white on red `#D7261E` 5.0:1; footer text on charcoal 8.6:1 or better. Pass.
- Two fonts (Epilogue, IBM Plex Mono), body 16px at 1.55, same h1/h2/h3 on every page: pass.
- CSS variables in `:root`, one `style.css`, same header and footer everywhere, nav marks the current page: pass.
- Mobile first: the stylesheet is now written with `min-width` media queries, so phone is the base. Pass.
- Labels, hints, error messages, alt text, focus ring: pass. "Would pass as a dynamic site once PHP saves the forms."

## 6. Hans, groupmate rebuilding in PHP
"The CSS reads top to bottom in numbered sections and it's all hex colours, flex and grid. I can explain all of it. The JS uses `function` and `for` loops, no fancy helpers. Things I'd need to look up before the defense: `URLSearchParams`, `localStorage`/`sessionStorage`, `closest()` and `dataset`. They're commented, so that's fine. The little `<script>` in the head that adds `js` to the page is explained in a comment now. The header and footer are identical in every file, so they cut straight into `header.php` and `footer.php`."
- No blockers. **Minor:** the four lookups above; mention them at the defense as "standard browser features".

## 7. Keyboard and screen reader
- Skip link, landmarks (header, nav, main, footer), labels on every input, `aria-live` on errors, count and track result, focus moved to success slips: pass.
- Status tags carry a word and an icon: pass.
- Fails: after Approve, focus lands on a button that only says "Undo", with no hint of what it reverses. **Minor**

## Fix list (de-duplicated, by severity)
1. **Major** Menu button showing on desktop. (fixed before the visits)
2. **Major** Type filter buttons stacked full width on phone. (fixed before the visits)
3. **Major** Officer phone view: no jump from the counts to each table.
4. **Major** Reference and student numbers wrapping in the laptop officer table.
5. **Minor** Soldering station dead end on Tools.
6. **Minor** Standing descriptor line missing from the home page.
7. **Minor** Undo button gives screen reader users no context.
8. **Minor** "Reference:" label in mono on phone cards.
9. **Minor** Toolbar fields misaligned on laptop (bottom-aligned with uneven hints).

## After fixes
- 1: `.pill .menu-toggle { display: none; }` in the desktop query so it beats `.btn`.
- 2: `.seg` set back to `flex-direction: row`.
- 3: each count label in the stats row is now a link to its table (`#p-pending`, `#p-overdue`, `#p-apps`, `#p-stock`), 44px tall.
- 4: `white-space: nowrap` on mono cells and the Student column. Approve and Decline now sit side by side on laptop.
- 5: "None left. Ask an officer" links to the contact list on About.
- 6: "Engineering Innovation • Research • Technology • Leadership" sits above the home h1 and in every footer.
- 7: Undo gets `aria-label="Undo, marked approved"` (or declined, accepted, returned).
- 8: card labels use the body font.
- 9: toolbar uses `align-items: start`.

Re-checked phone and laptop on officer (signed in) and tools: all fixed.

**Still open**
- Phone officer cards are still long (about 380px each). Fine for a prototype; the real site could show 5 per page with PHP.
- Nine-field reserve form on a phone. Name, student number, email and course could be remembered after the first request once there are accounts.
- No "back in stock" date for items with none left; needs the borrow records from the database.
