# QA: Route Line (web-design-engineer)

Checked 2026-11-23. Phone shots through a true 390px (and 360px) iframe, laptop at 1280 x 800. Behaviour checked by reading `app.js` / `style.css` and by scripted runs on temporary copies: a filled Reserve submit, an empty Join submit, officer sign-in plus Approve and Decline, Track with `?ref=`. 13 screenshots, all deleted afterwards.

## 1. Mika, 2nd-year ME, budget Android, between classes
"Tools page, the soldering station is the second row and the Reserve button is right there next to '2 of 3 available'. Tapped it, the form already had the soldering station and said I can take up to 2. But first I had to scroll past a whole screen of circles before the form even started. Filled it in, got HYG-2026-0142 big and clear with a Track button. Fast enough."
- Worked: search, chips, Available now only, item pre-selected from the link, quantity hint, return date hidden for consumables, big reference number, Track link carries the number.
- Failed: on Reserve the route line (4 stops, about 330px) sat above the form on phones, so the first field started below the fold. **Major** (reserve.html, `aside.side`).
- Failed (first build): catalog rows put stock and the full-width Reserve button on separate lines, about 210px per item. **Major** (tools.html, `.item`). Fixed before the formal pass: stock and Reserve now share one line.
- Minor: date pickers show dd/mm/yyyy from the phone, fine.

## 2. Paolo, Hygears officer, phone after class, laptop at the office
"The four numbers up top tell me what's waiting and they jump to each list. Approve and Decline are big, and the count drops when I act. On the laptop it's a proper table. On my phone each request is a tall block, but readable."
- Worked: summary counts update, status shows icon + word, Mark returned / Mark reviewed, stock list with Out / Low / OK.
- Failed (first build): on phones the course and purpose lines under a name fell into the label column of the stacked rows. **Major** (officer.html, `.table td`). Fixed: label is now positioned on the left, values stack properly.
- Minor: no Undo after Approve or Decline. Pending cards are about 280px tall on phones.
- Minor: after a decision the action cell said a stray "Done".

## 3. Bea, 1st-year from the ASCEND post
"Red HG logo, red buttons, the 'Engineering Innovation • Research • Technology • Leadership' line in the footer and the hashtag. It's calmer than their Facebook posts but it's clearly them, and the night photo of the Luna with the quote is the part that feels like the org. Apply to join is on the home page twice and in the menu."
- Worked: join reachable in one tap, committees as big tappable tiles, clear errors, friendly success with my first name and email.
- Failed: the "What happens next" route said "The Internal Affairs team reads every application", a fact nobody gave us. **Major** (join.html, brief: no invented facts).
- Failed: like Reserve, the quote and route sat above the form on phones. **Major** (join.html).
- Minor: the committee tiles lost their flex layout because `.field label` beat `.choice` (radio and text still lined up, spacing tight).

## 4. Senior UI/UX designer
- Keep: one strong idea used with discipline. The route line is the same component on Home (how borrowing works), Reserve, Track, Join and both success states, horizontal on laptop and vertical on phones. Swiss/transit restraint: white, one gray, near-black, red only for actions and the nav marker. Type is one family at three fixed sizes, mono only for reference numbers and counts.
- Hierarchy is clear; the catalog as a departure board reads well on laptop.
- Weakest screen: Home "Latest from Hygears", three dashed pubmat slots and date slots look unfinished until real posts arrive. **Minor** (needs content, not design).
- Minor: the Home route shows all four stops filled, which reads as "all done"; acceptable as a map, but a reader could expect the "you are here" state.
- Minor: inputs, upcoming stops and dashed slots used `#9AA0AB` (2.6:1 on white), too faint for form borders. See accessibility.

## 5. Sir Cadaoas, Web Development professor
Checked against `ui-requirements-nov21.md`.
- Pass: limited palette (white, #F4F5F7, #14161A, red for actions), text contrast 5:1 or better everywhere (gray text 6.1:1 on white, 5.6:1 on gray; white on red 5.0:1), two fonts, 16px body with 1.5 line-height, same h1/h2/h3 tokens on every page, all colours as hex variables in `:root`, one `style.css`, identical header and footer, current page underlined in red (Reserve highlights Tools), action words (Reserve, Track Request, Apply to Hygears), labels + hints + errors on every field, alt text on photos, visible focus ring, mobile first media queries, favicon and page titles, borrowing rules page, search and filter by name, category, type and availability, cancel on a pending request.
- Minor: Google Fonts link means the fonts need internet; offline it falls back to Arial cleanly.
- Would it pass as a dynamic site at the defense? The static pages map one-to-one to PHP: the item rows, officer tables and track lookup are already written as the rows a PHP loop would print.

## 6. Hans, groupmate who rebuilds it in PHP
- Worked: plain HTML, Flexbox and simple Grid, no `:has()`, no `clamp()`, no oklch, every CSS and JS section commented. Header and footer are identical blocks ready to cut into `header.php` / `footer.php`.
- Failed: `trackForm.requestSubmit()` is not something we covered and hides where the work happens. **Minor**. Fixed: a plain `runTrack()` function.
- Might need a sentence at the defense: `td::before { content: attr(data-label) }` for the phone tables, `closest()` and `dataset` in JS. All are basic and commented.

## 7. Accessibility tester (keyboard + screen reader)
- Worked: skip link, `header` / `nav` / `main` / `footer` landmarks, `aria-current="page"`, labels on every input, hints and errors linked with `aria-describedby`, `aria-invalid` on bad fields, focus moves to the first error, error summary `role="alert"`, results count and track result in `aria-live`, officer actions announced, status always icon + word, Reserve buttons include the item name for screen readers, Menu button has `aria-expanded`.
- Failed: input borders at 2.6:1 fail the 3:1 rule for form controls. **Major** (all forms, `--line-strong`).
- Minor: Escape did not close the phone menu.
- Minor: focus box drawn around the dashboard heading and success panels when JS moves focus there.

## Fix list (de-duplicated, by severity)
| # | Severity | Issue | Page |
|---|---|---|---|
| 1 | Major | Route/side column above the form on phones pushes the first field below the fold | reserve, join |
| 2 | Major | Invented fact: "Internal Affairs team reads every application" | join |
| 3 | Major | Form control borders 2.6:1, under 3:1 | all forms |
| 4 | Major | Catalog rows too tall on phones (fixed during build) | tools |
| 5 | Major | Officer phone rows: second lines fell into the label column (fixed during build) | officer |
| 6 | Minor | Committee tiles lost flex layout (`.field label` override) | join |
| 7 | Minor | `requestSubmit()` not taught | track (app.js) |
| 8 | Minor | Escape does not close the phone menu | all |
| 9 | Minor | Focus box on JS-focused headings and panels | officer, reserve, join |
| 10 | Minor | Stray "Done" text after an officer decision | officer |
| 11 | Minor | Home news slots look unfinished; no Undo for officers; tall officer cards on phones | home, officer |

## After fixes
- 1: `.side-last` puts the route after the form on phones (flex `order`), back beside it on laptop. Re-shot Join at 390px: the form now starts right under the page heading and the quote and route follow it. Reserve uses the same class.
- 2: now "Officers read every application." The next step after review stays a marked slot.
- 3: `--line-strong` changed to `#7D8492` (3.8:1 on white, 3.5:1 on gray).
- 4 and 5: fixed during the build and re-shot (stock + Reserve on one line; officer labels positioned left).
- 6: selector is now `label.choice`. 7: `runTrack()` function. 8: Escape closes the menu and returns focus to Menu. 9: `[tabindex="-1"]:focus { outline: none; }` (only for elements JS focuses; real controls keep the ring). 10: cell is cleared.
- Verified by scripted run after fixes: filled Reserve shows HYG-2026-0142 with the route at "Pending"; empty Join shows the summary, every field error and the committee error; officer Approve/Decline updates status and the pending count drops to 1.

**Still open:** real pubmats and dates for the news rows, pickup room, review time, ID and replacement rules, the real item list and photos, the step after a membership review, Undo for officer actions, and fonts loading offline.
