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
