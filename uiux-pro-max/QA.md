# QA: Pit Board (uiux-pro-max)

Two rounds of checks, on 2026-11-22 and 2026-11-23.
- Round 1 used the first warm palette (cream and amber).
- Before round 2 the brief changed (BRIEF.md, "UPDATE 2026-11-23"): white and cool gray, near-black text, red for actions only, a charcoal footer, no cream or amber, and code that students can rebuild from class lessons. The site was re-themed, and `style.css` and `app.js` were rewritten in plain form. Round 2 checked that version.

**How it was checked.** Phone screenshots at 390 and 360 wide were taken through an exact-width iframe (`skill-lib/phone.sh`), because headless Chrome lays out at about 500px when asked for 390. Laptop screenshots at 1280. Behaviour was checked by reading the code and by scripted runs that dump the page after the script runs:
- a valid Reserve for a consumable
- an invalid Reserve for a tool
- Track with a lowercase reference number, and with an unknown one
- officer sign-in, then Approve and Mark returned

## 1. Mika, 2nd-year ME, budget Android, between classes
"I type 'sold' on Tools and the soldering station is the second card anyway. One dark sign says 2 of 3 left, and Reserve is a big red bar. The form opens with the soldering station already picked. Nine fields is a lot, but every box is tall and the email field brings up the email keyboard. When I skipped fields, the top told me exactly what to fix, with links. I got HYG-2026-0143 on a big sign with a Track button."
- Works: search, the "Available now only" filter, the item arriving pre-picked from the card, the quantity hint, the error summary, the reference plate, and the Track link that carries the number.
- Round 1, major: each card showed stock three ways (plate, pill and meter) and was about 340px tall. **Fixed.**
- Minor, kept on purpose: the category chips scroll sideways at 360px.

## 2. Paolo, officer, phone then laptop
"Four counters at the top: pending, overdue, applications, out of stock. Tapping one jumps to its list. On my phone each request is a card with Approve and Decline side by side. Approve turns into an Approved tag with Undo, and the counter drops."
- Round 1, major: on the phone card the course ("BSME 2-1") fell into the label column. **Fixed.**
- Round 1, minor: a single "Mark returned" button was half width. **Fixed.** Only the pending counter updated. **Fixed:** all three now recount. Out-of-stock items were buried at the bottom of the stock list. **Fixed:** they're sorted first.
- Round 2, major: the action cell was `display:flex` on the `<td>` itself. On the laptop that broke the table cell, so the last column's borders didn't line up. **Fixed:** the buttons now sit in a `div.row-actions` inside a normal cell.

## 3. Bea, 1st-year from the ASCEND post
"It looks like the classic Hygears: red, white, black and the HG mark. The footer has 'Engineering Innovation • Research • Technology • Leadership' and the hashtag. Join is in the menu and twice on Home. 'Be the missing piece' is their own recruitment line."
- Round 1, minor: on the phone the Committees box came before the form. **Fixed:** the form comes first on phones.
- Open: the footer uses the red logo on charcoal inside a white border. The white HG mark the brief mentions isn't in `../assets/`.

## 4. Senior UI/UX designer
"It's committed to one look: hard black borders, offset shadows, square corners, and mono for numbers. The pit-board plate (a dark sign with a big mono number) repeats on Home, Tools, Reserve success, Track and Officer, so it reads as one system. In gray and white it's calmer than the cream version and still not template-looking. Red now only means 'do this'."
- Round 1, major: stock was shown three ways. **Fixed.** Minor: the laptop photo slots were too tall. **Fixed:** they're 2:1. Red was used as decoration on the footer edge and the quote rule. **Fixed:** both are black now.
- Round 2, minor: the home quick-track band had no side padding on phones, because `.quick-track` padding overrode `.wrap`. **Fixed.**
- Weakest screen: Tools on the laptop, until real item photos replace the dashed photo slots.

## 5. Sir Cadaoas (ui-requirements-nov21.md)
| Rule | Result |
|---|---|
| One primary, one accent, neutrals | Pass. Red `#D7261E` is for buttons and the current-page bar only. Neutrals are white, `#F4F5F7`, `#14161A`, `#5B6270` and the charcoal footer. Errors use the darker red with a "!" badge |
| 4.5:1 contrast | Pass. White on red 5.0:1. `#14161A` on white 18:1. `#5B6270` on white 6.1:1 and on `#F4F5F7` 5.6:1. White on charcoal 16.9:1 |
| Never colour alone | Pass. Every status has an icon and a word. Pending, Approved and Declined also differ by fill and border style |
| Two fonts, 16px body, same h1/h2/h3 | Pass. Space Grotesk and Space Mono. Heading sizes are variables, changed only in media queries |
| CSS variables, one stylesheet, same header/footer, current page | Pass |
| Real content, action words, labels/hints/errors | Pass. Missing facts are marked "Date to confirm", and the borrowing rules are marked as a draft |
| Feedback states | Round 1 **blocker**: the success panels showed before anyone submitted (`.success{display:grid}` overrode `hidden`), and the consumable return date never hid. **Fixed** with `[hidden]{display:none !important}`. A scripted run confirms it |
| Alt text, focus, mobile first | Pass |

## 6. Hans, rebuilding it in PHP
"Every page is plain HTML with the same header and footer blocks, so I can cut those into `header.php` and `footer.php`. `style.css` has numbered sections and comments, hex variables, Flexbox and simple Grid, and three media queries at 640, 768 and 992px. `app.js` is plain functions and `addEventListener`, with a comment on each section."
- Round 1, major: the CSS used `clamp()` font sizes, logical properties (`padding-inline`), `text-wrap`, CSS alt-text `content: "x" / ""`, `repeating-linear-gradient`, a gradient select arrow, `counter()` rule numbers and `auto-fit/minmax`. The JS used an IIFE, `$`/`$$` helpers and the Constraint Validation API. **Fixed:** all rewritten plainly. Font sizes are variables that change in media queries. Validation is a readable `checkField()` that reads normal HTML attributes (`required`, `pattern`, `minlength`, `type="email"`) and messages from `data-` attributes.
- Still slightly beyond basics, but explainable: `aspect-ratio`, `object-fit`, `:focus-visible`, the attribute selector `[aria-current="page"]`, `URLSearchParams`, `localStorage` (inside try/catch) and `closest()`. Each one has a comment.

## 7. Keyboard and screen reader
- Works: the skip link; landmarks; every input labelled and linked to its hint and error; the error summary takes focus and its links jump into the field; the success panel takes focus; the `#live` region announces requests and approvals; focus moves to Undo after an action; Escape closes the menu; a 3px black focus outline everywhere (white in the footer).
- Round 1, blocker: "Request sent" was readable before sending. **Fixed** (the `hidden` fix above). Minor: photo slots were announced as images. **Fixed:** they're `aria-hidden`.
- Open, minor: phone tables use `display:block`. Chrome keeps the table semantics, but some older browser and screen reader pairs don't. The PHP build could add ARIA table roles.

## Fix list (de-duplicated, by severity)
1. **Blocker.** `hidden` overridden by component `display` rules (success panels, consumable return date). Fixed.
2. **Major.** Stock shown three times per card, cards too tall. Fixed.
3. **Major.** Phone officer cards: course in the label column. Fixed.
4. **Major.** Laptop officer table: action cell was a flex `<td>`, so the table broke. Fixed.
5. **Major.** Code beyond class level (clamp, logical properties, Constraint Validation API, IIFE and similar). Fixed by rewriting.
6. Minor. Half-width single buttons, counters not updating, stock list order, text-character status icons. All fixed.
7. Minor. Red as decoration, tall photo slots, no visible label on the quick-track box, Committees before the form, noisy photo slots, quick-track padding. All fixed.

## After fixes
- Palette swapped everywhere to white, `#F4F5F7`, `#14161A`, `#5B6270`, red `#D7261E` (hover `#B51E17`) and charcoal `#1B1D22`. A grep finds no cream, amber, oklch, color-mix, `:has()` or `clamp()` left in the folder.
- Re-checked on the phone (390 and 360) and laptop (1280): Home, Tools, Officer (after Approve and Mark returned), Reserve error and success, Track.
- Scripted results:
  - The valid consumable reservation hides the form, shows HYG-2026-0143, and hides the return date.
  - The invalid tool reservation lists 6 problems, including "Return date must be on or after the pickup date."
  - `hyg-2026-0129` is uppercased and shows Declined, and an unknown number shows an error under the field.
  - The officer counters go 3→2 pending and 2→1 overdue.

Still open:
- The student-number format (`2024-12345-MN-0`) is our assumption. Confirm it with the org.
- Real item photos, announcement dates, office hours and the final borrowing rules.
- The white HG mark for the dark footer.
- Phone-table semantics in older screen readers (see 7).
- The login is a prototype that accepts anything. The PHP build needs `password_verify()` and sessions.


## News feature (2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html` ("From the pit lane."), `article.html`, a "Latest from Hygears" strip on Home (it replaces the three Announcement cards), an Applications open / closed tag on Join (`join.html?season=closed` shows the closed card), a Posts section on the officer desk with a fifth counter plate, and News in every header (after Home). Screens: news phone 390 and laptop 1280, article `?id=5` phone (full), officer Posts phone and laptop (signed in by script), home strip laptop, join closed phone. Behaviour checked with a headless script that signed in and drove the officer form: empty Publish, a .txt file, a 3 MB file, a real PNG, Publish, then read news.html, index.html and `article.html?id=6`.

### Student reading an article on a phone
"Back to News at the top, then the date on a little black pit-board plate, the category box and a 'Sample article' sticker. The title is big and uppercase like every page. The text is 18px with space between paragraphs, the photos have the same thick frame and hard shadow as Home, and the inline one has a caption bar."
- Pass.

### Officer publishing (phone, then laptop)
"There's a 'published posts' plate with the other counters, so I can jump to Posts. On the phone the posts table turns into the same cards as the reservations. Empty Publish gave 'Fix 3 things to continue' with links (title, category, body). A .txt file and a 3 MB file each got a message under the field. A real photo showed a preview in a frame, then asked me to describe it. Publish shows 'Saving...' for a moment like the other forms, then my post is at the top of the table with 'Published ... shows on News in this browser', and first on News, Home and its own page."
- Major (fixed): on the laptop the posts table wrapped the date onto two lines and stacked Edit above Unpublish in every row.
- Blocker caught while building (fixed before testing): the error-summary box and the Summary textarea both had `id="p-summary"`. The box is now `p-errors`.
- Minor (open): photos are stored as data URLs in localStorage, so a few 2 MB photos fill it. The form catches it and says to use a smaller photo; the real site saves files in `uploads/`.

### Bea from Facebook looking for news
"News is in the menu right after Home and the cards are the things their page posts about: PHYNIX, the General Assembly with the Merakis, ASCEND and the SOLIDWORKS finalist. The Recruitment chip filters to ASCEND. Everything says Sample."
- Pass. No invented results, numbers or quotes.

### UI critic: does News fit?
"Yes. Cards are the catalogue's bordered hard-shadow cards, the dates are pit-board plates (the site's one idea: every number on a plate), the filter is the Tools chip row, the category is the existing `.tag`, the officer list is the existing card-on-phone table, the form is the Join form, status uses the Published (solid) / Draft (gray) tags."
- Minor (fixed): on Join, the Applications open/closed tag touched the lead paragraph.
- Minor (open): Home's lower "Apply to join" button is still red, and in the closed state the Committees card still mentions the Google Form.

### Sir Cadaoas
- Pass: same header/footer on all 9 pages, News current on news.html (`aria-current="page"`) and article.html (`aria-current="true"`), one style.css (new section 14b, commented), same h1/h2/h3 variables, every new field has a label, hint and error, alt text on every photo (a cover photo must be described before publishing), red only on Publish.

### Hans (PHP rebuild)
"Same style as the rest of app.js: top-level `const`, plain functions, string concatenation, one section per page. `SAMPLE_POSTS` is the posts table; `getPosts()`/`savePosts()` are the SELECT and INSERT/UPDATE; the next id is AUTO_INCREMENT. Required fields use the same `required` + `data-required` attributes as Join, so `setupForm()` checks them with no new code. The file check sets `data-extra-error`, which the existing `checkField()` already reads. FileReader is only the preview; PHP uses `move_uploaded_file()` and `htmlspecialchars()` where this uses `esc()`."
- Pass.

### Accessibility
- Pass: chips are buttons with `aria-pressed`, the post count is `aria-live`, each card has one title link plus "Read more" with the title in hidden text, Edit/Unpublish buttons carry the post title in hidden text, the error summary takes focus and links to fields, the publish result takes focus and is also announced through `#live`, the photo description is disabled (skipped) when there is no photo.

### Regression
Home hero, quick track, shelf, Tools, Reserve, Track, Join (open), About and the rest of the officer desk are unchanged. The phone menu lists 7 items; the counter plates are 2 per row on phones, 4 then 1 on tablets and 5 in a row from 992px.

### After fixes
- Posts table: `.posts-table` keeps the date on one line and the two buttons side by side from 768px.
- Duplicate id removed (`p-errors`).
- `.page-head .status` gets a top margin.
- Still open: photo size vs. localStorage (prototype only), Home's red Apply button, the Google Form line on a closed Join page.
