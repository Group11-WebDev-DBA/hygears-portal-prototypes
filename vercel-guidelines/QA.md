# QA: Spec (Vercel Web Interface Guidelines direction)

Checked on 2026-11-23. Phone screenshots at 390 x 844 and 360 x 800 (true narrow viewport through an iframe), laptop at 1280 x 800. Behaviour was tested in headless Chrome with a script that filled and submitted every form and clicked the officer actions (filters, reserve validation and success, consumable rule, track lookups, join, sign-in, approve/decline/undo).

Severity: **blocker** stops the job, **major** hurts it badly, **minor** is polish.

## 1. Mika, 2nd-year ME, budget Android, between classes

I typed "soldering" in the Home search and it opened Tools already filtered. Reserve brought the station along, and the quantity said "Up to 2 available now", so I didn't have to guess. Name and email autofilled. When I skipped Purpose, the page jumped straight to it with a red message under the box. I had the reference number with a Copy button in under a minute.

- **Blocker, tools.html, item list:** "Showing 1 of 12 items", but every card was still on screen. The filter hid items with `hidden`, and the CSS `display: grid` on `.item` overrode it.
- **Major, tools.html, top of page:** on my phone the sample notice plus three filters took up the whole first screen. I couldn't see a single item without scrolling.
- **Minor, Home search:** the placeholder "e.g. soldering statio" got cut off.
- **Minor, Tools search:** "solder" also brought up Safety Goggles, because search read the descriptions ("…drilling or soldering").
- **Minor:** I have to type my details again for every reservation.

## 2. Paolo, officer, phone after class, then laptop

The four counts at the top jump to their sections. On my phone, every request turns into its own card with full-width Approve and Decline buttons, which is easy to hit. On the laptop it's a proper table with lined-up numbers. Undo saved me from a mis-tap.

- **Major, officer.html, Decline:** the Track page shows students a "Reason from the officer", but I had no way to give one. Decline also fired instantly with no confirmation step.
- **Major, officer.html phone cards:** the Student cell broke apart (the course landed in the label column), and the stock counts split into pieces.
- **Minor:** the nav still says "Officer Sign In" while I'm signed in.

## 3. Bea, 1st-year from the ASCEND post

Same red HG mark, the "Engineering Innovation • Research • Technology • Leadership" line, and the hashtag in the footer. "Apply to Join" sits next to Browse Tools on Home, and the ASCEND card links straight to the form. Picking a committee is just tapping a whole row.

- **Minor:** it's much calmer than their posts. The energy has to come from the campaign graphics that go into the announcement slots.
- **Minor, join.html:** nothing told me every field was required until I hit an error.

## 4. Senior UI/UX designer

Disciplined system: one radius, hairlines instead of shadows, a mono face only for figures and codes, and red that only ever means "act". The type scale is the same on every page. The request timeline ties Reserve, Track and the officer view together.

- **Major, tools.html laptop:** 4:3 empty photo slots took over the cards. The first Reserve button sat below the fold. Weakest screen.
- **Minor, index.html:** three identical dashed pubmat slots read as unfinished. They're honest placeholders, but they need real graphics.
- **Minor, reserve.html:** the "What You Need" legend sat 2px off the form edge.
- **Minor, copy:** "We Build People, Too" and "build with us" break second person.

## 5. Sir Cadaoas, grading against ui-requirements-nov21.md

Passes: one primary (red), neutrals, accent only on buttons/current page. Every status has an icon and a word. Contrast: body 16:1, muted 6.1:1, white on red 5.0:1. Two fonts. 16px body at 1.5. h1/h2/h3 come from variables. All colours, fonts and spacing are in `:root`. One `style.css`. Identical header and footer. `aria-current` plus a red bar on the current page (Reserve lights Tools). Every input has a label, hint and error. Alt text on every photo. Visible focus. Mobile-first media queries. Real content only, with dashed "from officers" slots where facts are missing.

- **Minor:** the forms don't say up front that every field is required (same as Bea).
- **Note for the defense:** status colours (green, dark red) go beyond "one primary, one accent". They're defended as meaning plus icon plus word, never decoration.

## 6. Hans, rebuilding it in PHP

Plain HTML. Each page is header + main + footer, so they split cleanly into `header.php`/`footer.php`. The item cards and table rows are a straight loop to rewrite in PHP. The form `name`s already match the DB columns we planned (`student_number`, `course_section`, `year_section`). The JS is sectioned and commented.

- **Minor, style.css steps:** CSS counters (`counter-reset`) weren't taught.
- **Minor, app.js:** `closest()`, `dataset`, `URLSearchParams`, `Intl.DateTimeFormat` and event delegation will need a one-line explanation each at the defense. They're commented.
- **Minor, style.css:** `content: attr(data-label)` for the phone table cards is the most "clever" line. It's commented.

## 7. Keyboard and screen reader tester

Skip link first. Landmarks are header/nav/main/footer. The menu button has `aria-expanded`, and Escape closes it. Errors are tied to fields with `aria-describedby` plus `aria-invalid`, and the first error gets focus with a "3 fields need a fix" live message. The result count is a live region. The success panel takes focus. Approve/Decline buttons include the reference in hidden text, and focus moves to Undo after an action.

- **Major, tools.html:** item cards are `h3` directly under the page `h1` (skips a level).
- **Minor:** `.choice:focus-within` also shows a ring on mouse click (accepted: it's the guideline's pattern for compound controls).

## Vercel guidelines review (run on the built files)

```
style.css      - [hidden] overridden by display:grid on .item → add [hidden]{display:none!important}
style.css:884  - input:focus not :focus-visible → kept on purpose for text fields (typing caret context); buttons/links use :focus-visible
style.css      - .steps uses CSS counters → literal numbers (student-copyable)
tools.html     - h1 → h3 skip → add visually hidden h2 "Items"
tools.html     - <select id="cat"> missing autocomplete → autocomplete="off"
reserve.html   - <select id="item"> missing autocomplete → autocomplete="off"
reserve.html   - date range errors fall back to "Choose the day…" message → data-range-msg + customError checked first
officer.html   - Decline is immediate destructive action → reason step + Undo
index.html     - "We Build People, Too" / "build with us" first person → second person
app.js:50      ✓ Intl.DateTimeFormat for all dates
app.js:37      ✓ filters, track ref and officer view mirrored in the URL
app.js:204     ✓ beforeunload warning on half-filled forms
style.css:59   ✓ scroll-padding-top so the sticky header never covers focused fields
style.css:66   ✓ overscroll-behavior: none only under (pointer: fine)
all pages      ✓ img width/height, lazy below fold, fetchpriority on hero; skip link; theme-color; color-scheme; touch-action; tap highlight; tabular-nums; "…" and curly quotes; placeholders end with "…"; autocomplete + name on inputs; spellcheck off on email/codes; no zoom lock; no transition: all; prefers-reduced-motion
```

## Fix list (de-duplicated, by severity)

1. **Blocker:** filtered-out items still show (`[hidden]` vs `display: grid`).
2. **Major:** officers can't give a decline reason, and Decline has no confirmation.
3. **Major:** phone dashboard cards break the multi-part cells (Student, stock count).
4. **Major:** phone Tools: filters plus the notice push every item below the first screen.
5. **Major:** laptop Tools: oversized empty photo slots push Reserve below the fold.
6. **Major:** heading level skip on Tools.
7. **Minor:** search matched descriptions (Goggles for "solder").
8. **Minor:** Home placeholder cut off.
9. **Minor:** no "All fields are required" note.
10. **Minor:** wrong error message for a return date before pickup (found by the test script).
11. **Minor:** CSS counters, first-person copy, legend offset, missing `autocomplete` on selects.
12. **Minor (open):** nav says "Officer Sign In" while signed in. No remembered details. Calm tone versus campaign energy.

Also found and fixed during the build: `.section` padding shorthand wiped the container's side padding on Reserve and Track, so the forms touched the screen edge on phones.

## After fixes

Re-checked with phone screenshots (Tools at 390, dashboard at 360) and laptop screenshots (Tools, Reserve), and re-ran the behaviour script. Everything passes.

- **1:** added `[hidden] { display: none !important; }` to the base styles. `tools.html?q=solder` now shows only the Soldering Station on phone and laptop.
- **2:** Decline now opens an inline reason picker (3 reasons) with **Decline Request** and **Cancel**. Approve stays one tap. Both show Undo, and the pending count and live message update.
- **3:** wrapped multi-part cells in one `<span>`, and status chips keep their natural width. The 360px cards read cleanly.
- **4:** the sample notice became one small line under the results count, and filter spacing got tighter. The first item and its Reserve button now show on the first screen when you arrive from Home search.
- **5:** photo slots are now 2:1. The first row of Reserve buttons fits on a 1280 x 800 screen.
- **6:** added a visually hidden `h2` "Items".
- **7:** search now matches item name and category only.
- **8:** the placeholder is now "e.g. drill…".
- **9:** Reserve and Join start with "All fields are required."
- **10:** pickup/return now get "Pick a date from today onward." and "Return date must be on or after the pickup date."
- **11:** steps use literal 01/02/03. Copy changed to "Build Skills, Not Just Vehicles" and "apply to join the team". The legend offset is gone, and the selects have `autocomplete="off"`.

**Still open (minor):** the nav label while signed in. Students' details aren't remembered (would need localStorage or a PHP session). The announcement cards need real pubmats and dates. Borrowing period, late policy, review time and pickup place still need officer input. Fonts load from Google Fonts, so offline they fall back to system fonts.

## News feature (2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html` (category filter, newest first), `article.html?id=N`, a "Latest from Hygears" strip on Home (replaces the three Announcements slots), Applications open/closed on Join, and a **Posts** section on the officer dashboard (list with Edit / Unpublish, New Post form with FileReader preview, Save Draft / Publish). News is in every header and in the footer Portal list. Posts live in `localStorage` under `hygears-spec-posts`, so a published post shows on News and Home in the same browser.

Checked with phone screenshots at 390 x 844 (News, article top and body, Home strip, officer form, officer post cards, Join closed), laptop at 1280 x 800 (News, article, officer list) and 1024 (header fit), a 360px overflow check on every page, and a headless Chrome script that ran the officer flow end to end (empty publish, draft, wrong file type, 3 MB file, good PNG, publish, unpublish a sample, edit) and then read News, Home and the article.

### Student reading an article on a phone
News shows one card per row: photo, mono category, date, title, two lines, Read more. The article is 18px with roomy lines, and the photos sit between paragraphs with captions. Back to News is at the top, More Posts at the end.
- **Minor, index.html:** the "All news" link beside "Latest from Hygears" was a 20px-tall text link, hard to hit with a thumb.
- **Minor, index.html:** three full cards make Home long on a phone (accepted: they replace the three pubmat slots that were there before).

### Officer publishing a post (phone, then laptop)
Empty Publish lists three errors and jumps to Title. Save Draft works with just a title. A .txt file and a 3 MB PNG each get a plain message and are dropped; a real PNG shows a preview with Remove Photo. Publish puts the post at the top of the list, says "Published ... View the post or open News", and the post is first on News and Home.
- **Major, officer.html phone:** the New Post form sat under six stacked post cards, a long scroll before you could start writing.
- **Major, app.js:** the photo errors flashed and vanished. The shared live-validation listener on the form re-checked the file input after the change handler and cleared the message.
- **Minor, officer.html laptop:** dates in the posts table wrapped onto two lines ("24 Nov / 2026").

### Bea, from Facebook, looking for news
News is the second item in the header and the Home strip links to it. Posts cover the same events as their Facebook page (PHYNIX, the General Assembly, ASCEND, the SOLIDWORKS finalist), each marked Sample. Join now says "Applications open: ASCEND 2026", and the closed state points to Facebook and News instead of a dead form.
- **Minor (open):** `join.html?applications=closed` still shows the aside line about this year's Google Form.

### UI critic: does News fit?
Yes. It reuses the card, `.meta`, the mono label face, the dashed "from officers" slot for missing covers, and the results bar and sample note from Tools. The officer list is the same table-to-cards pattern as the rest of the dashboard. The article is the one new layout, kept to a 44rem column on the same type scale. Red still only marks actions and the current page.

### Sir Cadaoas rules
One style.css (section 22 added), the same header and footer with News highlighted on news.html and article.html, labels/hints/errors on every new field, alt text on covers and inline photos, 16px+ body (article 18px, line-height 1.7, 68ch), 44px tap targets, no sideways scroll at 360px, and `[hidden]{display:none !important}` already in the base styles. Sample text uses only the brief's facts: no results, numbers or quotes beyond the org's own lines.

### Hans: rebuild in PHP
Each post field is a `posts` column (`post_id, title, category, summary, body, cover_image, cover_alt, caption_by, status, published_at, created_by`). `getPublishedPosts()` is the SELECT, `postCardHtml()` is the loop body, `escapeHtml()` is `htmlspecialchars`, and the two submit buttons are `name="action"` for `$_POST['action']`. FileReader is only the preview; PHP uses `move_uploaded_file` into `uploads/`.
- **Minor:** `event.submitter` and data URLs each need a one-line explanation at the defense (both are commented).

### Accessibility
New pages keep the skip link and landmarks. The post count is a live region, cards are `h3` under an `h2`, and the title is the card's one tab stop (Read more is hidden from the keyboard so it isn't read twice). The success panel takes focus, Edit/Unpublish buttons carry the post title in hidden text, and errors use `aria-describedby` + `aria-invalid`.
- **Major, officer.html:** officer-uploaded covers got a generated alt ("Cover photo: title") that says nothing about the picture.

### Regression
Home, Tools (`?q=solder` still shows 1 item), Reserve, Track (`?ref=` lookup), Join, About and the officer approve/decline flow load with no script errors and with the new nav item. The header still fits on one line at 1024px.

### Fix list
1. **Major:** photo errors cleared by the shared live-validation listener.
2. **Major:** no way to describe an uploaded cover for screen readers.
3. **Major:** New Post form buried under the list on phones.
4. **Minor:** "All news" tap target; table dates wrapping.
5. **Minor (open):** closed-state aside text; long Home on phones.

### After fixes
- **1:** the file check now uses `setCustomValidity`, so the shared validator shows the same message. An old error is cleared on submit when no file is chosen. Re-tested: both messages stay.
- **2:** added "Describe the photo", shown and required only when a photo is chosen. It's saved as `cover_alt` and refilled on Edit.
- **3:** a "Write a New Post" button under the Posts heading jumps to the form.
- **4:** `.section-head-row > a` is now a 44px target, and `.table time` doesn't wrap.

Re-ran the officer script (every step passes, no script errors) and re-shot the officer form on the laptop. **Still open:** the closed-state aside line; posts are per browser until PHP/MySQL; photos are capped at 2 MB because the prototype stores them in localStorage; all five posts need real text and dates from the officers.
