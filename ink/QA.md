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


---

# News feature (QA run 2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html`, `article.html`, the "Latest from Hygears" strip on Home, the applications open/closed state on Join, a Posts section on the Officer desk, and News in every header and footer. Checked at 390 x 844 and 360 x 800 (phone) and 1280 x 800 and 980 wide (laptop) on news, article (`?id=3`), home, join (`?season=closed`) and officer (signed in, with a photo chosen). The publish flow was run end to end in headless Chrome: empty form, wrong file type, a 3 MB file, a good PNG with preview, missing photo description, publish, unpublish a sample, edit and save, then news.html, index.html and article.html read back in the same browser profile. No page scrolls sideways at 360px.

## 1. A student reading an article on a phone
"I tapped the ASCEND post from News. The category and date are on top, the title is big, then the team photo and the text. The text is a good size and the lines aren't too long. Back to News is right at the top, and at the end there are three more posts. The News list itself was the problem at first: six filter buttons took three rows and the first post was a huge empty 'Photo to come' box, so I saw no news on the first screen."
- Works: 18px body at 1.7 line height, about 68 characters per line; Back to News at the top; More posts at the end; "Sample article" marked.
- Fails: News list on a phone, filter in three rows plus an empty 200px photo slot before the first headline. **Major**

## 2. Paolo, officer, publishing on phone and laptop
"New post is a red button next to Sign out, so I don't scroll past four tables to find it. The form is the same gray slip as everything else. I picked a photo and saw it straight away, with Remove photo under it. Publish with nothing filled in: every missing field said what to do. A 3 MB photo got 'That photo is 3.0 MB. Use one under 2 MB.' I published, the post sat on top of the list with a message linking to News, and it was there on News. On the laptop the dates broke over two lines. When I edited a post and saved, the message said 'Published' again, which made me think I'd posted it twice."
- Works: preview with FileReader, type and size checks, required title, category, date and body, Publish vs Save draft, Edit and Unpublish/Publish per row, status message that gets focus.
- Fails: date column wrapped on laptop. **Minor**
- Fails: edit confirmation said "Published". **Minor**
- Fails (found reading the code, fixed before the visit): the site-wide "no past dates" rule also hit the post date, so an officer couldn't post about last week's event. **Major**

## 3. Bea, from Facebook, looking for news
"News is the second link in the menu. The ASCEND post and the General Assembly are there, and 'Merakis' and 'Nex-thinkers' are their own words. When I opened the closed version of Join it still said 'Apply here' and 'Pick the committee you would most like to work in' with no form under it, which is confusing."
- Works: News in nav, highlighted on news and article; posts use the org's own event names; Join shows "Applications open" with the ASCEND line.
- Fails: Join closed state left the application heading and committee text on the page, and the lead still said "Apply here". **Major**

## 4. Senior UI/UX designer
"News is built from parts the site already has: the black top rule from the catalogue rows, the gray tags, the Tools segmented filter, the slip for the form. No new colours: red is only on Publish, New post and the nav marker. It looks like the same site. The article is a calm single column. Weak spots: on a laptop the article column sits left with an empty right side (consistent with every page head here, so I'd leave it), and three 24px card titles in a row are heavy but readable."
- No new issues beyond the phone list (see 1).

## 5. Sir Cadaoas
- Palette and accent: category tags are gray with words, red only for actions. Pass.
- Same h1/h2/h3 sizes; article body 18px (1.125rem), line height 1.7, max 68ch. Pass.
- One `style.css` (new section 14), one `app.js`, same header and footer, News marked current on news and article. Pass.
- Labels, hints and error text on every New post field; alt text on every photo, and officers must describe their cover photo. Pass.
- "The officer publishes from the browser and the list updates. That's the dynamic part the defense needs, once PHP saves it."

## 6. Hans, rebuilding it in PHP
"The posts are one array of objects whose keys match the `posts` columns. news.html is a loop over the published ones, newest first, which is `SELECT ... WHERE status = 'published' ORDER BY published_at DESC` and a `while` loop in PHP. The form fields use the column names (`title`, `category`, `summary`, `body`, `caption_by`). New things to look up before the defense: `FileReader` and data URLs (PHP replaces them with `move_uploaded_file` into `uploads/`), `JSON.stringify`/`JSON.parse` for localStorage, and `sort()` with a compare function. All commented."
- No blockers. **Minor:** the lookups above.

## 7. Accessibility
- Filter is a fieldset with a legend and real radio buttons; the post count is `aria-live`.
- Each post has one heading; "Read more" carries the title for screen readers; list thumbnails have empty alt because the title follows, while the article's photos have full alt text.
- Officer: Edit and Unpublish buttons are labelled with the post title; the status message is `role="status"` and gets focus; Edit moves focus to the form heading; every field has a label, hint and `aria-live` error.
- Fails (fixed while building): the spec's form had no way to give the cover photo alt text. **Major**

## Fix list (News feature)
1. **Major** News list on a phone: filter in three rows and an empty photo slot before the first headline.
2. **Major** Join closed state still showed the application heading and "Apply here".
3. **Major** Post date blocked past dates. (fixed before the visits)
4. **Major** No alt text for officer cover photos. (fixed while building)
5. **Minor** Officer posts table: dates wrap on laptop.
6. **Minor** Editing a post said "Published".

## After fixes
- 1: filter buttons on News are 44px tall with smaller padding and text, so six fit in two rows at 390px; posts without a photo hide the empty slot on phones (it stays from 640px up so the grid lines up). Re-shot: the first headline is on the first screen.
- 2: the closed message moved under the page heading, the whole application section (`#apply`) hides when closed, and the lead now reads "Applications open each ASCEND recruitment season".
- 3: the post date has `data-nomin`, and the "no past dates" loop skips it.
- 4: "Photo description" field, checked in `extraCheck` only when a photo is chosen.
- 5: `white-space: nowrap` on the Date column.
- 6: edits now say "Saved changes to ...".

**Still open**
- Browser storage holds about 5 MB, so only a few posts with photos fit. When it is full the form says so. The real site saves files to `uploads/` and keeps only the file name.
- News, the home strip and the article are drawn by JavaScript, so without JS they show a short note. PHP will print them on the server.
- No Delete (the spec asks for Edit and Unpublish). Clearing the browser's site data brings the sample posts back.
- Two samples have no photo, so laptop News and Home show one "Photo to come" box.
