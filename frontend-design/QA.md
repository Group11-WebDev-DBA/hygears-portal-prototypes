# QA: Shadow Board (frontend-design), round 2 after the 2026-11-23 palette and code update

Round 1 (Nov 22) fixed the empty Reserve dropdown, the Tools filters on phones, officer focus after Approve/Decline and the inline styles. This round re-runs QA-PROTOCOL.md on the restyled site. Screens: index phone 390 (full page) and laptop 1280, tools phone 360, reserve `?item=soldering` phone, officer `#signed-in` phone, track phone and laptop. Code read: style.css, app.js, all 7 pages.

## 1. Mika (budget Android, one thumb)
"Home: Reserve a tool next to Join, and the wall shows soldering station '2 left'. Tapping it opens the form with the station already picked and 'Up to 2'. Tab bar at the bottom, my thumb is already there. But on Home there's a giant night photo of the PUP Lagoon sign that takes almost a whole screen before the announcements."
- Major: index phone (and laptop): the quote-band photo ignored its 16:9 / 4:3 ratio and showed at its full HTML height (about 650px). `img` had `width: 100%` but the `height` attribute stayed in force.
- Minor: Tools at 360px: the category and type chips scroll sideways (the last chip is cut off on purpose, but there is no hint).

## 2. Paolo (officer)
"Phone: four tally boxes, then pending cards with big Approve/Decline, overdue with Mark returned / Send reminder, then new applications. Works one-handed. When I opened the desk the 'Officer desk' heading had a thick black box around it, like it was an error."
- Minor: programmatic focus on the desk heading draws a heavy outline.
- Minor (open from round 1): Decline has no reason field.

## 3. Bea (from the ASCEND post)
"White, gray and red with the HG logo, like the old red-and-white profile pictures. Footer still has the 'Engineering Innovation • Research • Technology • Leadership' line and the hashtag. Join is a button in the hero and 'Apply to join' sits on the ASCEND announcement."
- Pass. The warm cream of the recruitment art is gone by design (the 11-23 brief).

## 4. Senior UI/UX designer
"The pegboard still carries the site and reads cleaner in cool gray: dark silhouettes pop more than on cream. Charcoal tab bar, quote band and footer give it weight. Weakest screen: Track. On the Pending and Declined tags the 'Request sent' step had no visible circle, so the steps looked misaligned."
- Major: track: done steps on white tags drew a white check on a white circle (`background: currentColor` resolved to the white text colour). Pre-existing, but more visible now.
- Minor: the red ring on the tag eyelet used the action red on a decorative detail.

## 5. Sir Cadaoas (professor)
- Pass: red only on buttons and the current-page bar; neutrals white #FFFFFF, gray #F4F5F7, near-black #14161A, secondary #5B6270, charcoal #1B1D22. No amber, orange or cream left in CSS or HTML.
- Pass: contrast. Ink 18:1, secondary 6.3:1 (5.8:1 on gray), white on red 5.0:1, tab-bar gray #C9CED6 on charcoal about 11:1, field borders 3.4:1.
- Pass: one font family (Archivo, two widths), 16px body, same h1/h2/h3 variables everywhere, one style.css, same header/footer, `aria-current` on the current page.
- Minor: the red eyelet ring (see designer) is decoration in the action colour.

## 6. Hans (rebuilding in PHP)
"app.js is ES5: `var`, functions, string concatenation, comments per section. I can read all of it. The CSS is mobile first with two media queries. Things I had to look up: `font-stretch` (Archivo's width axis), `clip-path: polygon` on the tag, the radial-gradient pegboard. All three now have a one-line comment."
- Major (fixed before QA): removed clamp() type sizes (now plain rem per breakpoint), `min()` in .wrap, `:has()` on the Tools section (now a `.section--filters` class), `inset`, `env(safe-area-inset-*)`, `calc(var(--i) * 70ms)` delays (now `nth-child` delays; the `style="--i:"` attribute is gone from app.js), rgba shadows/hatching (hex), `padding-block`/`-inline` (plain top/bottom, left/right), `scrollbar-width`.
- Minor: `clip-path` stays for the tag shape; explainable in one sentence, commented.

## 7. Accessibility tester
- Pass: skip link, landmarks, labels and hints with `aria-describedby`, error summary `role="alert"`, live count on Tools, status = icon + word (+ dashed/hatched tags).
- Pass: focus moves to the result line after Approve/Decline (round 1 fix still works; it keeps its own outline).
- Minor: heading focus ring looks like an error (Paolo).
- Minor (open from round 1): stock rows on phones use `display: grid` on `tr`.

## Fix list (de-duplicated, by severity)
1. Major: home quote-band photo (and any photo with width/height attributes) ignores its aspect ratio.
2. Major: Track tags: done-step circles invisible on white tags.
3. Major (done before QA): advanced CSS removed, palette swapped (Hans, professor).
4. Minor: red used on the decorative tag eyelet.
5. Minor: heavy outline on headings focused by app.js.
6. Minor: no hint that the chip rows scroll sideways on 360px phones.
7. Minor (round 1): Decline reason field; stock table semantics on phones; saved details on shared computers.

## After fixes
- 1: `img { height: auto; }` in the base. Re-shot laptop: the night photo is 4:3 beside the quote; phone: 16:9.
- 2: `.steps li.is-done::before` uses `background: var(--ink)` with a white check. Re-shot track on phone: all three tags show their step circles.
- 4: eyelet ring is now light gray `--peg` with an ink edge; red stays for actions and the current page.
- 5: `[tabindex="-1"]:focus { outline: none; }` in the base. The officer result line keeps its own outline (its rule comes later).
- Still open: 6 (cut-off last chip is the only hint), and the round 1 items in 7.

## News feature (2026-11-24)

Added per `../FEATURE-NEWS.md`: `news.html`, `article.html`, a "Latest from Hygears" strip on Home (replaces the four Announcements), an Applications open / closed state on Join (`join.html?season=closed`), a Posts section on the officer desk, and News in every header. Screens: news phone 390 and 360, news laptop, article `?id=3` phone (full), officer `#signed-in` phone (390 and 360) and laptop, join closed phone, home laptop. Behaviour checked with a headless script that drove the officer form: empty Publish, a .txt file, a 3 MB file, a real PNG, then Publish, then read news.html, index.html and `article.html?id=6`.

### Student reading an article on a phone
"News is in the bottom bar now, between Home and Tools. The article reads like a real news page: category box, date, 'Sample article', the big condensed title, a photo with a border like the tool photos, then 18px paragraphs that don't run edge to edge. 'Back to News' sits at the top and More posts at the end."
- Minor (fixed): the Back to News arrow showed as a broken glyph (a bad CSS escape).
- Minor: on phones every card has a 16:9 cover, so only one post fits per screen. Kept: it matches the photo-led cards elsewhere.

### Officer publishing (phone, then laptop)
"Posts has a box in the tally row that jumps straight there, so I don't scroll past the whole stock table. Empty Publish gave me 'Give the post a title', 'Pick a category', 'Write the article' and focused the title. A .txt file: 'That file is not a JPG, PNG or WebP photo.' A 3 MB photo: 'That photo is 3.0 MB. Use one under 2 MB.' A real PNG showed a preview and asked me to describe it. Publish put my post at the top of the list with a 'Published... shows on News' line, and it was first on News, on Home and on its own article page."
- Major (fixed): on the laptop the post cards ran the full width, so Edit and Unpublish became 500px bars. Now two cards a row.
- Minor (open): the photo is stored as a data URL in localStorage, so a few 2 MB photos fill the browser's storage. The form catches that and says to use a smaller photo. The real site saves the file in `uploads/`.

### Bea from Facebook looking for news
"The same things their page posts (PHYNIX, the General Assembly with the Merakis, ASCEND, the SOLIDWORKS finalist) are on News with the same names, and I can filter to Recruitment. The home page shows the three newest."
- Pass. All five are marked sample; no invented results, numbers or quotes.

### UI critic: does News fit?
"It is built from the site's own parts: post cards are the white label plates with the 4px ink top edge from the tool wall, the filter is the Tools chip row, the officer list reuses the request cards, the form is the Join form. No new colours; red stays on Publish and the current tab."
- Minor: Home's lower "Be part of the team" band still has a red Apply button, so Join is not fully secondary yet. Left, because applications are open in the sample season.

### Sir Cadaoas
- Pass: same header/footer with News added on all 9 pages, News marked current on news.html (and article.html, as `aria-current="true"`), one style.css, same h1/h2/h3, labels, hints and error messages on every new field, alt text on every photo (the officer must describe a cover photo before publishing).

### Hans (PHP rebuild)
"`SAMPLE_POSTS` maps to the posts table one to one, `getPosts()`/`savePosts()` are the SELECT and INSERT/UPDATE, the new id is AUTO_INCREMENT. FileReader is only for the preview; in PHP it's `move_uploaded_file` into `uploads/`. All ES5 like the rest of app.js."
- Pass. One thing to explain: `esc()` exists because officer text goes into innerHTML (in PHP: `htmlspecialchars`).

### Accessibility
- Pass: chips are buttons with `aria-pressed`, the count is a live status, cards have one title link plus "Read more" with the title in hidden text, the publish result is a status line that takes focus, errors are tied with `aria-describedby`, cover preview has alt text.
- Minor (fixed): the article page marked News with `aria-current="page"` although it is not the News page; now `aria-current="true"` (CSS matches any `aria-current`).

### Regression
Home hero, tool wall, Tools, Reserve, Track, Join (open), About and the officer desk render as before. The phone tab bar now has six tabs (60px each at 360px, still over 44px), no sideways scroll at 360px on News or the officer form.

### After fixes
- Back arrow escape fixed (`content: "\2190"`).
- Officer post cards two a row from 56rem.
- Article nav marker uses `aria-current="true"`.
- Still open: photo storage limit in localStorage (prototype only), Join's lede still says "Applying takes about three minutes" in the closed state, Home's red Apply button.
