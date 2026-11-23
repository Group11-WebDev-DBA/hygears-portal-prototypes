# QA: Shadow Board (frontend-design)

Checked on Nov 22, 2026. Screenshots at 390 x 844 and 360 x 800 (phone, through an exact-width frame, because headless Chrome won't go below about 500px wide) and 1280 x 800 (laptop). Pages shot: index, tools, reserve, track, officer. Join and About were checked by reading the code plus a scripted run of every form (22 checks: reserve, track, join, tools filters, officer actions).

## 1. Mika, 2nd-year ME, budget Android, between classes

"Home has 'Reserve a tool' right under the headline, and the wall shows the soldering station with '2 left', so I just tapped it. That opened the form with the soldering station already picked and a 'Up to 2' hint. Big boxes, my thumb hits them fine, and the tab bar at the bottom is where my thumb already is.

Problems: the first time I tapped the soldering station, the Item box was **empty** and the picture above the form was blank, so I couldn't tell what I was reserving. On Tools I had to scroll past the search box, two rows of chips and their labels before I saw a single tool. And the form is long: I have to type my name, student number, email and course every single time."

- Reserve: item dropdown empty, item summary blank. **Blocker** (the main job fails).
- Tools: on a phone the filters push the whole wall below the fold. **Major**.
- Reserve: personal details retyped on every request. **Minor**.
- Reserve: "Back to tools" is a plain text link, a small tap target. **Minor**.

## 2. Paolo, officer, phone after class, then laptop

"Phone: four boxes at the top tell me 3 pending, 1 overdue, 2 new applications, 3 low or out, and tapping a box jumps to that list. Approve and Decline are full-size buttons and the count drops when I act. Stock turns into readable rows on the phone instead of a squashed table. Laptop: requests on the left, stock on the right, all on one screen.

Problems: when I declined something there was no place to say why, but the student's track page shows a reason. With the keyboard on the laptop, after I pressed Approve the focus jumped back to the top of the page and I lost my place in the list."

- Officer: focus lost after Approve/Decline (the buttons are removed). **Major** (also #6).
- Officer: Decline doesn't ask for a reason. **Minor**, left open.

## 3. Bea, 1st year, came from the ASCEND post

"It's the same HG logo and the same red, and the cream pegboard feels like their posts' warm cream. 'Find your missing piece' is right there on Join, and the committees are the same five from the post, as big buttons I can tap. The footer has 'Engineering Innovation • Research • Technology • Leadership' and the hashtag, like every post.

Problems: after I sent the form it said 'Welcome aboard', which made it sound like I was already accepted. There's less orange than in the posts, it reads redder."

- Join success: "Welcome aboard" promises acceptance. **Minor**.
- Brand: orange appears only through the logo. **Minor**, by design (orange text fails contrast on cream; see NOTES).

## 4. Senior UI/UX designer

"There's one idea and it's carried through: the pegboard and the painted outlines. A tool that's out is literally a pale painted shape on the wall, which explains stock without a legend. The condensed Archivo headings give it the bold workshop-label feel without a second font. Red only shows up on buttons, so it's always clear what to press. It doesn't look like a template: no rounded cards with soft shadows, no eyebrow labels.

Weak spots: the Tools page on a phone opens on controls instead of the wall (Mika's point). The announcement rows have four identical 'Pubmat slot' boxes, so that section looks unfinished until real graphics go in. The officer tally boxes are the most generic part of the site. The tools page explainer is a long sentence for something the wall already shows."

- Tools phone above the fold (same as Mika). **Major**.
- Tools page explainer too long. **Minor**.
- Announcements: placeholder pubmats look empty. **Minor**, needs real material.

## 5. Sir Cadaoas, Web Development professor

Against `ui-requirements-nov21.md`:
- Limited palette: red for actions, brown-black and cream/white neutrals, amber only as the current-page bar and the tag eyelet. Pass. He may ask why amber is there; it's the brief's allowed small accent.
- Accent only for actions: red appears only on buttons. Pass.
- Contrast: body 16:1, hints 8.9:1, white on red 5.0:1, field borders 4.6:1. Pass.
- Two fonts max: one (Archivo, two widths). Pass. 16px body, line-height 1.55, same h1/h2/h3 tokens on every page. Pass.
- CSS variables in `:root`, one `style.css`, same header/footer, current page highlighted (amber bar plus `aria-current`; Reserve highlights Tools). Pass.
- Labels, hints and error messages on every input, action words on buttons (Reserve, Track request, Apply, Approve). Pass.
- Alt text on photos, decorative logo next to its own text uses `alt=""`. Pass.
- Tables reflow on phones. Pass.
- **Found:** about a dozen inline `style=""` attributes in the HTML (margins). He asked for one stylesheet with no copied styles, so this would get flagged. **Major**.
- Dynamic site: items, stock, requests and the dashboard all render from one data list in `app.js`, which maps straight onto a MySQL table and PHP loops later.

## 6. Accessibility tester (keyboard and screen reader)

- Skip link, `header` / `nav` / `main` / `footer` landmarks, one h1 per view. Pass.
- Visible focus on every control (3px brown outline; amber on the dark tab bar and footer). Pass.
- Filter chips use `aria-pressed`; the "12 items shown" count is a live region. Pass.
- Forms: errors are linked with `aria-describedby`, fields get `aria-invalid`, an error summary with `role="alert"` appears and focus moves to the first bad field. Success moves focus to the confirmation heading. Pass.
- Status never by colour alone: stock has an icon and a word ("None left"), requests show a clock/check/cross plus Pending/Approved/Declined, and Declined tags are also hatched. Pass.
- Officer desk: after Approve/Decline the focused button is deleted, so focus drops to the page body. **Major** (same as Paolo).
- Stock table on phones uses `display: grid` on rows, which can strip table semantics in some screen readers. **Minor**, left open.

## Fix list (de-duplicated, by severity)

| # | Severity | Page | Problem |
|---|---|---|---|
| 1 | Blocker | Reserve | Item dropdown empty and summary blank. `form.elements.item` returns the collection's built-in `item()` method, not the select, so the script stopped. The summary also showed because `display: grid` beat the `hidden` attribute. |
| 2 | Major | Tools (phone) | Filters push the wall below the fold |
| 3 | Major | Officer | Keyboard focus lost after Approve/Decline |
| 4 | Major | All | Inline `style=""` attributes break the "one stylesheet" rule |
| 5 | Minor | Reserve | Personal details retyped on every request |
| 6 | Minor | Join | "Welcome aboard" implies acceptance |
| 7 | Minor | Tools | Explainer sentence too long |
| 8 | Minor | Home | Mini-board counts ("3 of 4 on the wall") wrap to two lines on phones |
| 9 | Minor | Officer | No reason field when declining |
| 10 | Minor | Officer | Stock table semantics on phones |
| 11 | Minor | Reserve | "Back to tools" small tap target |

## After fixes

Changed:
1. **Reserve works.** The field is renamed `itemId`, and a global `[hidden] { display: none !important; }` rule stops the hidden summary from showing. Opening `reserve.html?item=soldering` now preselects the item, shows its silhouette, what it's for and "Up to 2". Scripted check: an empty submit shows 7 errors and the summary, asking for 5 when 2 are left says "Only 2 available right now.", a valid submit shows the HYG-2026-0142 tag with focus on its heading, and picking a consumable hides the return date.
2. **Tools on phones:** shorter explainer ("Dark tool: you can reserve it. Pale outline: all out right now."), the Category/Type labels are visually hidden on phones (screen readers still read them as group labels), and less top padding. At 360 x 800 the first row of tools now starts above the fold.
3. **Officer focus:** the result line ("Approved", "Declined", "Marked returned") gets `tabindex="-1"` and takes focus, and the live region still announces it. Scripted check passes.
4. **No inline styles left:** spacing moved to small utility classes in `style.css` (`.mt-3` to `.mt-7`, `.m-0`, `.mb-3`). `grep 'style="'` finds 0 on all 7 pages.
5. **Remembered details:** after a successful reservation, name, student number, email and course are saved on this device (localStorage) and filled in next time. The form says so. If storage is blocked it just isn't prefilled.
6. Join success now reads "Application sent, Bea." with no promise of acceptance.
7. The mini board on Home shows "3 left" so it fits on one line.
8. The officer review shortcut is now `officer.html#signed-in` (the old `#dashboard` scrolled past the header).

Re-checked: reserve, tools at 360 x 800 and track on phone, plus the officer desk on laptop. No horizontal scroll, the tab bar shows all five tabs at 360px.

Still open:
- Decline has no reason field (#9). The real PHP version needs one, because the Track page shows the officer's note.
- Stock rows on phones may lose table semantics in some screen readers (#10). The fix is to render a list instead of a table below 640px.
- "Back to tools" is still a text link (#11). The tab bar's Tools tab is the big target.
- Saved details on a shared lab computer: add a "Not you? Clear my details" link before this goes live.
- Placeholder pubmats and dates in Announcements need the real graphics.
