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


---

# News feature (QA run 2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html`, `article.html`, "Latest from Hygears" on Home (replacing the sample announcements and the drawn officer-form mock-up), the applications open/closed state on Join, a Posts section on the Officer dashboard, and News in every header (first link) and the footer's Hygears list. Checked at 390 x 844 and 360 (phone) and 1280 x 800 (laptop) on news, article (`?id=3`), home, join (`?season=closed`) and officer (signed in, with a photo chosen). The publish flow was run end to end in headless Chrome: empty form, wrong file type, a 3 MB file, a good PNG with preview, missing photo description, publish, unpublish a sample, edit and save, then news, home and article read back in the same browser profile. No page scrolls sideways at 360px.

## 1. A student reading an article on a phone
"The article opens with the category chip, the date and a 'Sample article' chip, then a big heavy title like their posts, the photo with rounded corners and the text. Text is comfortable and the lines aren't long. Back to News is at the top; More posts are cards like the tools ones."
- Works: 18px body at 1.7, max 68ch; same h1 size as every other page; Back to News; More posts; posts without a photo skip the slot on phones.
- No issues on the article.

## 2. Paolo, officer, publishing on phone and laptop
"There's a 'Posts and New post' button next to Sign out, so I don't scroll through four tables. The form is the same white card as Reserve, with the hint over each field. The photo preview shows right away and a 3 MB photo got 'That photo is 3.0 MB. Use one under 2 MB.' Publish put it at the top of the list with a link to News. On the laptop, Edit and Unpublish stacked in every row and doubled the table height."
- Works: preview, type and size checks, required fields with the site's "!" error style and the "N fields need fixing" line, Publish vs Save draft, Unpublish/Publish, edits say "Saved changes to", status message gets focus.
- Fails: Edit and Unpublish stacked in each laptop row. **Minor**

## 3. Bea, from Facebook, looking for news
"News is the first link in the menu, before Tools. The cards look like the Tools cards, the ASCEND post is there. With applications closed, Join says 'Follow us for the next ASCEND' with Facebook and Instagram links and no form, which is clear."
- Works: News marked current on news and article; Join open badge and closed card.
- No issues.

## 4. Senior UI/UX designer
"News reuses the site's own parts: the white card, the rounded photo, the outlined badge for the category, the Tools category select instead of a new filter, the dashed 'Photo from Hygears' slot. It is the same site. Two problems: on the laptop News page the page head, a 'Posts' label, the filter and the count stacked up so the first card started at the bottom of the screen; and on Home the section heading ran to four lines with the All news button floating beside the third line."
- Fails: News list starts below the first laptop screen. **Major**
- Fails: Home "Latest" heading too long, button misaligned. **Minor**

## 5. Sir Cadaoas
- Palette: no new colours; category is an outlined badge with words; red only on Publish, New post and the existing Reserve button. Pass.
- Same h1/h2/h3 on every page (the article title uses the page h1 size). Article body 18px at 1.7. Pass.
- One `style.css` (new section 20), one `app.js`, same header and footer, current page marked. Pass.
- Labels, hints, errors on the New post form; alt text on every photo; officers must describe their photo. Pass.

## 6. Hans, rebuilding it in PHP
"The news code follows this direction's `app.js`: inside the one function, `$`, `esc`, template strings, `map` and `filter`. The post objects use the `posts` column names, and the form fields too. To explain at the defense: `FileReader` and data URLs (PHP uses `$_FILES` and `move_uploaded_file()`), `JSON.stringify`/`JSON.parse`, `sort()` with a compare function, `reduce` for the next id, `Object.assign`. All commented. This direction's JS is the furthest from class style of the three, as before."
- No blockers. **Minor:** those lookups.

## 7. Accessibility
- Filter is a labelled select; the count is `role="status"`.
- One heading per card; "Read more" carries the title; card photos have empty alt (the title follows), article photos have full alt; the "Posts" heading on News stays for screen readers.
- Officer: buttons labelled with the post title; `role="status"` message gets focus; Edit moves focus to the form heading; every field has a label, hint and error tied with `aria-describedby`.
- Found while building: the stylesheet had no `.visually-hidden` class, so the table's "Actions" header would have shown. Added. **Minor**

## Fix list (News feature)
1. **Major** News list starts below the first laptop screen.
2. **Minor** Officer posts table: Edit and Unpublish stacked on laptop.
3. **Minor** Home "Latest" heading too long, All news button misaligned.
4. **Minor** No `.visually-hidden` class. (fixed while building)

## After fixes
- 1: the "Posts" label is now visually hidden and the count sits beside the category select from 640px up. Re-shot at 1280: the cards start on the first screen.
- 2: `#t-posts .btn-row` doesn't wrap. Re-shot: one line per post.
- 3: heading shortened to "Latest from Hygears. Posted by the officers." on one line with All news at its right.
- 4: `.visually-hidden` added in section 20.

**Still open**
- Browser storage holds about 5 MB, so only a few posts with photos fit; the form says so when it is full. The real site saves files to `uploads/`.
- News, the home strip and the article are drawn by JavaScript; without JS they show a short note. PHP prints them on the server.
- No Delete (the spec asks for Edit and Unpublish). Clearing site data restores the samples.
- `today()` in this direction's `app.js` uses UTC, so before 8 a.m. in Manila the default post date (and the reserve date minimum) is yesterday. It was already there; fix with local date parts if this direction is picked.
