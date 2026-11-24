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

---

## News feature (2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html` (category switch, newest first), `article.html?id=N`, a "Latest from Hygears" strip on Home (3 newest posts), Applications open / closed on Join (`join.html?applications=closed` previews closed), and a **Posts** section on the officer desk (table with Edit / Unpublish, "Write a new post", the New post form with a FileReader preview, Save draft / Publish, a fifth "Published posts" counter). News is in every header and lights up on News and the article page. Posts live in `localStorage` under `hygears-charge-posts`, so a post published on the officer desk shows on News, Home and its article in the same browser. Post cards reuse the 2px ink top rule of the old announcement rows; the filter reuses the Tools type switch.

Checked by script in headless Chrome (empty Publish, draft with a title only, a .txt file, a 3 MB PNG, a real PNG with preview, publish, unpublish, edit) and by screenshots at 390 x 844 and 1280 x 800.

### Mika, reading on her phone
- Works: News, the article and the Home strip are one column; cards show cover, category, date, title, summary and Read more. The article body is 18px with roomy lines, and Back to News is a full 44px link.
- **Major:** the category filter's six radio boxes stacked into five rows, so the whole first screen of `news.html` was filter and not one post showed.
- **Major:** every cover photo (cards, article, officer preview) ignored its 2:1 or 16:9 shape and drew at its full `height="720"` attribute, so one photo filled two phone screens.

### Paolo, posting from his phone and the office laptop
- Works: empty Publish shows "Give the post a title.", "Choose a category." and "Write the post body before publishing." at once, with red borders and focus on Title. A draft saves with only a title. A .txt file gets "This file isn't a photo. Choose a JPG, PNG or WebP image."; a 3 MB PNG gets "This photo is 3.0 MB. Choose one under 2 MB." A real photo shows a preview, then asks for a photo description. Publish puts the post first in the table and says where it went, with links to the post and News. Unpublish / Publish flips a row and announces it; Edit refills the form and keeps the photo.
- **Blocker (as handed over):** the Posts section was missing from `officer.html`. The JS for it was written, but none of its form elements existed, so officers could not post at all.
- Minor: on phones the "(sample)" tag in a post row sat in its own column beside the title.
- Minor: the success line said "now at the top of News" even when an edited post is dated older.

### Bea, from Facebook
- Works: the posts are the same events she saw on Facebook (PHYNIX 2026, the General Assembly, ASCEND 2026, the SOLIDWORKS finalist, Luna), each marked Sample. With applications closed, Join says "Recruitment opens once a season" and "Follow us for the next ASCEND", with Follow on Facebook and Read the News buttons, so the page is not a dead end.

### Senior UI/UX critique
- Works: News feels like part of Charge: same ink rules, kicker labels, type switch and gray photo slots. The article column keeps lines near 65 to 70 characters on a laptop.
- Minor: the selected category was shown only by the radio dot.
- Minor (open): Edit and Unpublish buttons in a row sit very close on laptop (same as Approve / Decline elsewhere).

### Sir Cadaoas
- Works: one style.css, CSS variables, red only on buttons and the current-page bar, status as icon plus word ("✓ Published", "○ Draft"), labels, hints and errors on every post field, alt text on covers (the officer must describe the photo).
- Minor: three inline `style=""` attributes (news hint, post saved text, textarea heights).

### Hans, rebuilding in PHP
- Works: every post field is named after its `posts` column (`title`, `category`, `published_at`, `cover_image`, `cover_alt`, `summary`, `body`, `caption_by`), the JS is commented by section, and it only uses what was taught plus FileReader and localStorage, both commented.
- Minor: `news.html?cat=` built a CSS selector from the link text, so a quote in the link threw an error.

### Accessibility
- Works: the filter is a fieldset with a legend; "Showing X of 5 posts" is a live region; the post saved message is `role="status"` and gets focus; Edit / Unpublish buttons carry the post title as sr-only text; Read more is hidden from keyboard and screen readers because the title link goes to the same place; status is never colour alone.

### Fix list (News feature)
| # | Severity | Issue | Page |
|---|---|---|---|
| N1 | Blocker | Posts section and New post form missing | Officer |
| N2 | Major | Cover photos ignore their aspect ratio | News, Home, Article, Officer |
| N3 | Major | Category filter fills the phone's first screen | News |
| N4 | Minor | Selected category shown by radio dot only | News |
| N5 | Minor | "(sample)" splits off the title in phone rows | Officer |
| N6 | Minor | Inline styles | News, Officer |
| N7 | Minor | A quote in `?cat=` throws | News |
| N8 | Minor | "Top of News" wording on edits | Officer |
| N9 | Minor | Row action buttons close together on laptop | Officer |

### After fixes
1. N1: the Posts section (table, "Write a new post" link, New post form with title, category, date, cover photo, photo description, summary, body, caption by, Publish / Save draft / Cancel edit) is now in `officer.html`, plus a fifth counter. The scripted run passes with no JS errors, and the published post then shows first on `news.html`, on Home and at `article.html?id=7`, with HTML typed into the title or body shown as plain text.
2. N2: `img { height: auto; }` in the base rules, so `aspect-ratio` wins over the width/height attributes. Phone and laptop shots confirm 2:1 cards, a 16:9 article cover and a normal-size preview.
3. N3: `.news-filter` is a tighter version of the type switch (less padding, smaller text). Three rows instead of five; the first cover now shows on the first phone screen.
4. N4: the chosen option gets a thicker ink border and bold text (`.is-on`, set in `showNews`).
5. N5: title and tag wrapped in one `<span>`.
6. N6: `.news-hint`, `.post-done p` and `.body-input` classes replace the inline styles.
7. N7: the start category is found by looping over the radios and comparing values; an unknown `?cat=` just shows All.
8. N8: the message now says the post "is published on News".

**Still open:** N9. Real text, dates and photos for all five sample posts; the real recruitment season for the open/closed switch (`APPLICATIONS_OPEN` in app.js). The 360px check for News and the post form was done by reading the CSS (one column, wrapping options, full-width fields), not with a 360 screenshot.
