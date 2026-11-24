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

## News feature (2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html` (category chips, newest first), `article.html?id=N`, a "Latest from Hygears" strip on Home built from the newest 3 posts (it replaces the three pubmat rows), Applications open/closed on Join, and a **Posts** section on the officer dashboard (table with Edit / Unpublish, a "Write a new post" jump button, the New post form with FileReader preview, Save draft / Publish, plus a fifth summary count). News is in every header. Posts live in `localStorage` under `hygears-routeline-posts`, so a published post shows on News and Home in the same browser.

Checked with phone screenshots at 390 x 844 (News, article top and body, Home strip, officer post rows, officer form with preview and errors, Join closed), laptop at 1280 x 800 (News, article, officer table and form), a 360px overflow check, and a headless Chrome script that signed in and ran the officer flow end to end (empty publish, draft, wrong file type, 3 MB file, good PNG, missing photo description, publish, unpublish a sample, edit), then read News, Home and the article.

### Student reading an article on a phone
News uses the same ruled rows as the departure board: thumbnail left, category in the stop-label style, date, title, summary, Read more. The article is 18px with line-height 1.7, photos between paragraphs with captions, Back to News on top and More posts at the end.
- **Minor, news.html / index.html:** the "Cover photo from officers" slot in a row was underlined, because it sits inside the thumbnail link.
- **Minor, news.html phone:** the Sample tag wraps under the date on narrow rows (accepted: it goes away when real posts replace the samples).

### Officer publishing a post (phone, then laptop)
The red "Write a new post" button sits next to the Posts heading, so the form is one tap away even under six stacked rows. Empty Publish shows the summary box and three field errors and focuses Title. Save draft needs only a title. A .txt file and a 3 MB PNG each get a plain message and are dropped; a real PNG shows a preview with Remove photo and asks for a photo description. Publish puts the post first in the table and says where it went, with links to the post and to News.
- **Major, style.css:** there was no `[hidden] { display: none !important; }` rule. Nothing broke yet, but any `hidden` element with a display rule (the preview box, the photo-description field) would have stayed visible.

### Bea, from Facebook, looking for news
News is the second header link, and Home's strip now links to "All news" instead of only Facebook. The sample posts match what she saw on their page (PHYNIX, the General Assembly, ASCEND, the SOLIDWORKS finalist), each tagged Sample.
- **Major, join.html closed state:** the aside's "What happens next" route still said "Send this form: You are here" while the form was hidden.

### UI critic: does News fit?
Yes. It is the site's own vocabulary: ruled rows with a 2px ink top rule (like the catalog board), uppercase stop-label type for the category, the pill chips from Tools for the filter, the dashed slot for missing photos, and the officer table that becomes labelled rows on phones. No new colours; red stays on buttons and the current-page bar.

### Sir Cadaoas rules
One style.css (section 15 added), the same header with News highlighted on news.html and article.html, labels, hints and error messages on every new field, a summary alert on the form, alt text on every cover and inline photo, 16px+ body (article 18px), 44px+ tap targets, no sideways scroll at 360px, sentence-case headings like the rest of the site. Sample text uses only the brief's facts.

### Hans: rebuild in PHP
`posts` columns map one to one to the post fields. `getPublishedPosts()` is the SELECT, `postRowHtml()` is the loop body, `escapeHtml()` is `htmlspecialchars`, and the two submit buttons are `name="action"` for `$_POST['action']`. The form reuses the existing `validateForm()` and `showError()`, so there is no second validation system to explain.
- **Minor:** `e.submitter`, `FileReader` and data URLs each need one sentence at the defense (commented in app.js).

### Accessibility
Chips use `aria-pressed` like Tools, the post count is a live region, rows are `h3` under an `h2`, the thumbnail and Read more links are hidden from the keyboard so each row is one tab stop, Edit/Unpublish carry the post title in hidden text, Unpublish announces through the existing `dash-announce` live region, and the success panel is `role="status"` and takes focus. Photo errors are written into the field's `error-msg`, which is tied to the input by `aria-describedby`.

### Regression
Home, Tools, Reserve, Track (`?ref=HYG-2026-0138`), Join, About and the officer sign-in and Approve/Decline flow load with no script errors and the new nav item. The laptop header still fits on one line.

### Fix list
1. **Major:** no `[hidden]` override in style.css.
2. **Major:** closed Join still showed the "You are here" route.
3. **Minor:** underlined slot text in post rows.
4. **Minor (accepted):** Sample tag wrapping on phones.

### After fixes
- **1:** `[hidden] { display: none !important; }` added to the base styles.
- **2:** the closed state also hides the aside, so the page shows only the closed panel with Follow on Facebook and Read the News. Re-shot at 390px.
- **3:** `.post-thumb` has no underline. Re-shot News on the laptop.

Re-ran the officer script after the fixes: every step passes with no script errors. **Still open:** posts are per browser until PHP/MySQL; photos are capped at 2 MB because the prototype stores them in localStorage; all five posts need real text, dates and photos from the officers; Undo for officer actions (from the first QA) is still open.
