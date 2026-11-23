# QA: "Charge" (superdesign)

Checked 2026-11-23. I took headless Chrome shots on a phone (390 x 844, plus 360 wide for overflow) and a laptop (1280 x 800). JavaScript states were shown by loading test copies that fill in and submit forms. I also read the HTML, CSS and JS.

**First-pass fixes made before the visitors (my own review of the first shots):** the item grid kept the browser's default list indent. The 4:3 photo slots made every card taller than a phone screen (now 2:1). The laptop filter bar squeezed the Type options into two rows (it's now two even rows). The gap under each page heading was doubled. The Home quick list wrapped differently on each row on phones (it's now a fixed grid).

**Overflow check:** at 360 px wide, `scrollWidth` = 360 on all 7 pages, the signed-in officer desk included. No sideways scroll.

---

## 1. Mika (2nd-year ME, budget Android, between classes)
"Home already shows the soldering station with its battery and **Reserve** right there, so I didn't even open the catalog. The form had my item picked and said 'Up to 2 available'. I left stuff blank on purpose and every field told me what was wrong. But only the Purpose box turned red. The other boxes looked normal, so I had to read each message to find them. After sending, the number HYG-2026-0142 was huge, and there was a Track button. Name and email filled in on their own."
- Works: two taps from Home to the form; the item comes in through `?item=`; the quantity limit follows stock; consumables hide the return date; the success screen has the reference number and a Track link; every button is at least 44 px tall.
- **Major:** error borders only showed on the textarea. `input[type=...]` beat `[aria-invalid]` on specificity (reserve, join, track, officer login).
- Minor: on a 390 x 844 phone, the Home hero fills the first screen, so "Available now" starts below the fold. The "Find a tool" button is visible, though.
- Minor: on phones the Tools filters take about 330 px before the first item.

## 2. Paolo (officer, phone after class, laptop at the office)
"Phone: the tables turn into labelled cards, the four counters jump to each section, and Approve changes the row to a black '✓ Approved' and the count drops to 2. Laptop: a normal table, quick to scan. Each request card on the phone is seven lines, so three requests is about two screens. After signing in there's a box drawn around 'Today at the desk' that looks like a glitch."
- Works: no sideways scroll at 360; Approve/Decline are 44 px; overdue shows "Late by" in bold words; stock uses the same batteries as the catalog; a "Sample data" notice is shown.
- Minor: the focus ring shows on the dashboard heading after JavaScript focuses it.
- Minor: phone cards are tall (cell padding).
- Minor (open): there's no undo after Approve/Decline, and applications have no action. Fine for a prototype.

## 3. Bea (1st-year, tapped through from the ASCEND post)
"The HG logo, 'ASCEND 2026 · Find your missing piece' and the hashtag on the thank-you screen feel like their page. The footer line is the one from their posts. It's red, white and black, not the orange of ASCEND, but it matches their classic logo. On my phone I had to scroll past a photo and the whole committee list before the form even started."
- Works: the success screen uses her first name and email; committees match the 2026 posts; there's a "Not sure yet" option; the year/section hint gives an example.
- **Major:** on phones the Join form started about 750 px down, below the info column.
- Note: the campaign orange is left out on purpose (brief update 2026-11-23). Campaign pubmats can go in the announcement slots.

## 4. Senior UI/UX designer
"One clear idea that also does a job: the battery reads at a glance and always sits next to words. The type pair is consistent, red is only on buttons and the nav bar, and the spacing is calm. It doesn't look generated. Weakest screen is About: honest but list-heavy. Bugs: on the laptop Reserve form, Student number and Course boxes sit at different heights. On Track, the result shows up under the sample card, so on a phone you tap Track and nothing seems to happen. The laptop hero text doesn't line up with the logo edge."
- **Major:** misaligned form rows on laptop. Grid fields stretched their label row when the field next to them had a hint.
- **Major:** the Track result was off-screen on phones after a lookup.
- Minor: the hero text's left edge was 36 px off the container.
- Minor (open): About is mostly lists. It could use a Luna photo or a timeline once real material exists.

## 5. Sir Cadaoas (grading against ui-requirements-nov21.md)
- Pass: one primary (red #D7261E), neutrals, red only on buttons and the current-page bar. Contrast: muted 6.1:1, white on red 5.0:1, on-dark 10:1. Two fonts (Barlow Semi Condensed + Barlow). 16 px body, line-height 1.55. h1/h2/h3 sizes set in `:root`. One `style.css` with hex variables. The same header and footer on all 7 pages, with `aria-current` on the current page (Reserve lights up Tools). Action-word buttons (Reserve, Track request, Apply, Send reservation). Labels, hints and error text on every field. Alt text on photos (logos are `alt=""` next to the visible name). Visible focus. Mobile-first media queries. Sample data and missing facts are marked as slots. No inline styles.
- Minor: error text and link hover use `--red-dark`. That's a status colour paired with a "!" mark, which the slides allow.
- "Dynamic" at the defense: the JS uses sample data, and the comments say where PHP/MySQL take over (reference number from the insert ID, login with `password_verify`).

## 6. Hans (rebuilds it in PHP)
"Plain HTML, and the header/footer blocks are marked for `header.php`/`footer.php`. The item cards are one repeated block with `data-` attributes, which is easy to loop in PHP. CSS is Flexbox plus simple Grid with numbered, commented sections. Things I'd need to read up on: `attr(data-label)` in the table reflow (it's commented), `aspect-ratio`, `URLSearchParams`, `dataset`, `classList.toggle(name, force)`, and `this` inside the click handlers."
- Minor (open): a few functions are declared inside `if` blocks (`applyFilters`, `showChosenItem`, `showRequest`). That's valid in browsers but worth knowing.
- Minor (open): `this` in two event handlers. `event.currentTarget` would be the same amount to explain.

## 7. Keyboard and screen reader tester
- Works: skip link; header, nav (labelled), main and footer landmarks; every input has a `<label>`, with hints and errors linked through `aria-describedby`; `aria-invalid` plus focus on the first error; a form-level `role="alert"`; success panels get focus; the officer desk announces "HYG-2026-0142 approved." through `role="status"`; Reserve buttons say which item (sr-only text); batteries are `aria-hidden` and the count is real text; status chips are an icon plus a word.
- **Major:** Track progress steps showed "done" by bar colour only. A screen reader heard "Sent, Reviewed, Ready for pickup" for every status.
- Minor: the "Showing X of 12" live region speaks on each keystroke.
- Minor (open): the selected Type option is shown only by the native radio dot, with no box highlight.

---

## Fix list (de-duplicated, by severity)
No blockers.

| # | Severity | Issue | Page |
|---|---|---|---|
| 1 | Major | Error border missing on inputs and selects | Reserve, Join, Track, Officer |
| 2 | Major | Track result off-screen on phones | Track |
| 3 | Major | Join form buried below the info column on phones | Join |
| 4 | Major | Track progress state shown by colour only | Track |
| 5 | Major | Form rows misaligned on laptop | Reserve, Join |
| 6 | Minor | Focus ring on JS-focused heading looks like a glitch | Officer |
| 7 | Minor | Tall officer cards on phones | Officer |
| 8 | Minor | Hero text not aligned with container on laptop | Home |
| 9 | Minor | Declined message guessed a reason ("may be booked") | Track |
| 10 | Minor | Home hero fills the first phone screen | Home |
| 11 | Minor | Tools filters take space on phones | Tools |
| 12 | Minor | About is list-heavy | About |
| 13 | Minor | Functions in blocks, `this` in handlers | app.js |
| 14 | Minor | Count live region chatty; Type option highlight | Tools |

## After fixes
1. Error borders: the selector is now `input[aria-invalid="true"], select[...], textarea[...]`. Shots confirm red borders on every invalid field, phone and laptop.
2. Track: the result card now sits directly under the form, with samples and help in the second column. After Track request or a sample tap, focus moves to the result, which scrolls it into view. Phone shot confirms.
3. Join: `.form-first` puts the form first on phones (`order: 2` on the aside); laptop keeps info on the left. Phone shot confirms the form starts right under the heading.
4. Track progress: done steps now read "✓ Sent", "✓ Reviewed", and so on, in the text itself. A declined request's third step says "Not approved".
5. `.field { align-content: start; }`. Laptop shot confirms Student number and Course line up.
6. `[tabindex="-1"]:focus { outline: none; }`. Keyboard focus rings on real controls are unchanged.
7. Table cell padding on phones is tighter (0.375rem to 0.25rem).
8. Hero text gets left padding to meet the container edge at 1280.
9. The Declined message now says: "Email the officers to ask why, or reserve again for other dates."
10. The phone hero photo is shorter (14rem to 12rem).

**Still open:** 11 to 14 above. Plus real item photos, the workshop room and pickup hours, the confirmed borrowing rules (marked Draft) and announcement dates (marked as slots). The "Bring your PUP ID" line is a proposed rule, tagged "rule to confirm".
