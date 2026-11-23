# QA: Impeccable direction ("Shadow Board")

Checked 2026-11-22 and 2026-11-23. Phone 390 x 844 and 360 x 800 (iframe harness, since headless Chrome won't go below ~500px), laptop 1280 x 800. Pages shot: index, tools, reserve, track (declined state), join, officer desk (phone and laptop). About was checked in code only. Behaviour was checked by reading `app.js` and `style.css`.

The first round ran on the cream/red build. The 2026-11-23 brief update moved it to white, cool gray and near-black with red for actions only, and asked for class-level code. That change is logged under After fixes.

## 1. Mika, 2nd-year ME, budget Android, one thumb
"Home has a big red Reserve a Tool button, so I tapped it. The search box is at the top of Tools. I typed 'solder' and got the soldering station with '2 of 3 units available' and a Reserve button. The form already had the soldering station picked and showed me the tool again at the top, which felt reassuring. Nine fields is a lot between classes, but the 'remember my details' box means next time it's just quantity, purpose and dates. The reference number is huge on the success screen."
- Major: on Tools, the magnifier icon covered the first letters of the search placeholder ("Try" was hidden).
- Minor: example placeholders like "BSME 2-1" and "2024-01234-MN-0" looked like values already filled in.
- Minor: on a 360px phone the filters take about 600px before the first tool. The first silhouette is still above the fold.
- Minor: label plates at 360px wrapped "Electronics · Tool, returned" onto two lines.

## 2. Paolo, officer, phone after class then laptop
"The jump buttons at the top (3 pending, 2 overdue, 2 new applications, 2 out of stock) take me straight to what matters. On my phone every request is its own card with Approve and Decline big enough to hit. On the laptop it's a normal table."
- Major: on the phone card, the student number dropped into the label column under "Student" and broke the two-column layout.
- Major (laptop, after recolour): reference numbers wrapped to two lines and Approve/Decline stacked, so rows doubled in height.
- Minor: "Nov 24 to n/a" for a consumable read like a bug.
- Minor: the phone desk is long (three pending cards at about 330px each). The jump links make up for it.

## 3. Bea, 1st-year from the ASCEND post
"It has the HG logo, the 'Engineering Innovation • Research • Technology • Leadership' line and the hashtag in the footer, so it's clearly them. Joining is in the nav, in the hero and in a big band at the bottom of home. The committee choice is five big tappable options."
- Minor: the Join page didn't mention ASCEND, which is the name from the post she tapped. Fixed.
- Note (after recolour): the site is now red/white/charcoal instead of their 2026 orange posts. That was the user's call (see BRIEF update). It matches their classic red-and-white profile pictures.

## 4. Senior UI/UX designer
"The tool board is a real idea. It isn't a card grid with a theme painted on: the peg board and silhouettes *are* the stock display, and a dashed empty slot says 'all out' faster than a badge. One type family with a narrow width for headings keeps it tight. Hierarchy is clear and spacing is consistent."
- Major: a red second line in the hero h1 used red for decoration, which blurs "red means act here". Removed.
- Minor: the goggles and filament spool silhouettes read as a chain link and a target. Both redrawn (goggles with a strap and nose bridge, the spool as a side view with flanges).
- Minor: the home board peek wasn't tappable, though it looks like it should be. Each available slot is now a link to its reserve form.
- Weakest screen: the officer desk on a phone. It's correct but plain and long.

## 5. Sir Cadaoas (lecture checklist)
- Pass: one shared `style.css` with `:root` variables. Header and footer are identical on every page (generated from one template). The nav marks the current page with `aria-current` plus a red bar. Body text is 16px at 1.55 line height. h1/h2/h3 are the same size on every page. One font family. Every input has a label, with hints and errors under the fields. Every image has alt text. Focus is visible. Mobile first. Real content, with samples labelled. Buttons use action words (Reserve, Track Request, Apply).
- Major: several pages had inline `style=""` attributes and h2s at custom sizes (aside titles, the error summary). He would call that inconsistent and "not using the stylesheet". Fixed.
- Major (after the brief update): red was used beyond actions (header band, silhouettes, join band). Fixed: red is now only buttons, the current-page bar, required stars and error states.
- Minor: the photos were 2 MB PNGs. Fixed with compressed 1200px JPG copies in `img/` (130 to 160 KB each).

## 6. Hans, groupmate rebuilding it in PHP
"Header and footer are the same block on every page, so they become `header.php` and `footer.php`. The item list in `app.js` is shaped like a table row, so it maps straight to a MySQL `items` table and a PHP `foreach`."
- Major (after the brief update): the first build used `clamp()`, `max()`, `:has()`, `font-variation-settings`, `all: unset`, custom properties passed into SVG `<use>`, and warm `oklch` notes in comments. Rewritten with plain hex variables, fixed rem/px sizes with media queries, `font-stretch`, explicit button resets, and plain inherited `fill`/`stroke`.
- Minor (still open): `app.js` uses arrow functions and template literals. They're standard vanilla JS, but a short walkthrough would help before the defense. The silhouette path helpers (`rr`, `ci`) are commented. In the PHP version they can become static SVG files.

## 7. Keyboard and screen reader tester
- Pass: skip link, header/nav/main/footer landmarks, Menu button with `aria-expanded` (Escape closes it), visible focus everywhere (white focus on the dark footer). The error summary takes focus and links to each field. Every input has `aria-describedby` for its hint and error. The Tools result count is a live region. Statuses are icon plus word. Out of stock is dashed shape plus words. Peg dots are hidden from screen readers because the sentence says the count.
- Major: on the officer desk, Approve/Decline/Mark returned removed the pressed button, so keyboard focus dropped to the page top. Fixed: focus moves to the row's new status chip, and the live message announces the change.
- Minor: the reserve success panel is announced through focus on its heading, not through the live region (live regions on unhidden elements are unreliable). That's acceptable.

## Fix list (de-duplicated, by severity)
| # | Severity | Issue | Status |
|---|---|---|---|
| 1 | Major | Palette must be white/gray/near-black, red for actions only (brief update) | Fixed |
| 2 | Major | Advanced CSS a student can't rebuild (clamp, :has, variation settings, custom props into SVG) | Fixed |
| 3 | Major | Officer phone card: student number broke the label grid | Fixed |
| 4 | Major | Officer laptop: refs and action buttons wrapping | Fixed |
| 5 | Major | Focus lost after officer actions | Fixed |
| 6 | Major | Inline styles and off-scale h2s | Fixed |
| 7 | Major | Search icon over placeholder | Fixed |
| 8 | Major | Decorative red in hero h1 | Fixed |
| 9 | Minor | Placeholders looked like filled values | Fixed ("e.g." prefix) |
| 10 | Minor | Goggles and spool silhouettes unclear | Fixed |
| 11 | Minor | Home board peek not tappable | Fixed |
| 12 | Minor | Long plate meta; "n/a" dates | Fixed |
| 13 | Minor | Join page didn't say ASCEND | Fixed |
| 14 | Minor | Heavy PNG photos | Fixed |
| 15 | Minor | Phone officer desk is long | Open |
| 16 | Minor | Filters push tools down on 360px phones | Open |
| 17 | Minor | Arrow functions and template literals in app.js need a walkthrough | Open |

## After fixes
Re-shot officer desk (390) and join (390) after the first fix batch, then index (390 and 1280), tools (360, with a search term) and officer desk (1280, twice) after the recolour.
- **Palette:** white `#FFFFFF` page, cool gray `#F4F5F7` board, near-black `#14161A` text, gray `#5B6270` secondary, charcoal `#1B1D22` footer and join band. Red `#D7261E` (hover `#B51E17`) now appears only on buttons, the current-page bar, required stars and errors. No cream, beige, amber or orange is left (checked by grep). Silhouettes are now black, which is closer to real workshop shadow boards anyway.
- **Header:** white with a hairline. The current page is red text plus a 4px red bar (left bar on the phone menu, underline on laptop).
- **CSS:** rewritten into 14 commented sections, hex variables only, fixed sizes with one media query for the larger headings, Flexbox and simple Grid. The only extras are one `@keyframes` for the lift and a `prefers-reduced-motion` query.
- **Fixes 3 to 14** are in. The officer table keeps references on one line, and the buttons sit side by side on laptop.
- **Still open:** #15 and #16 (phone length on the officer desk and tools pages, which could use a collapsible filter bar or tabs), #17 (JS walkthrough). The logo is the old red PNG, so the white HG mark the brief allows on the dark footer isn't available yet.
