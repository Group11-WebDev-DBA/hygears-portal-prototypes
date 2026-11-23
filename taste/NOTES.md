# Direction: Taste ("the ticket")

Built with the taste-skill (design-taste-frontend 2.5.1), kind **service** (site-kind other): real photographs, flat white and gray grounds, heavy type, no effects or 3D. Our professor's rules win wherever the skill disagrees.

## Pages
`index.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`. They share one `style.css`, one `app.js`, and the same header and footer. The nav marks the current page with a red bar, and `reserve.html` lights up Tools. Every page opens by double-click.

## Palette (updated 2026-11-23: classic Hygears red and white, no cream or orange)
| Role | Colour | Use |
|---|---|---|
| Action | red `#D7261E`, hover `#B51E17` | Buttons, the current-page bar, Sent/Publish pills. White label 5.0:1 |
| Ground | white `#FFFFFF`, gray `#F4F5F7` | Page and cards white; panels, photo slots, table heads and the ticket stub gray |
| Text | near-black `#14161A` (18:1), secondary `#5B6270` (6.3:1) | All text. Secondary for labels, hints and meta |
| Lines | `#DFE2E7` hairlines, `#858C98` input/card borders | |
| Footer band | charcoal `#1B1D22`, white text, gray `#B4BAC4` | Closing photo, HG mark, sign-off, directory |

Status never relies on colour alone. Every status badge is an icon plus a word: clock Pending, check Approved, cross Declined, triangle Low or Due.

## Fonts (two)
- **Host Grotesk** (Google Fonts) for everything. Headings use weight 700 to match the heavy display type in the org's posts. h1 is 40 to 72px, h2 28 to 48px, h3 20px, the same on every page. Body text is 16px with line height 1.55.
- **System monospace** (Cascadia Mono or Consolas) for reference numbers only.
- If the page is opened offline, Host Grotesk falls back to the system sans.

## The one idea
**Every request becomes a ticket.** The reference number (`HYG-2026-0142`) is set large in mono on a card with a dashed tear line. The same ticket appears in the reserve success state, on the Track page and in the officer queue, so a student always knows which object they are holding. The ticket stub is gray, cut off from the body by a dashed tear line. Heavy headings and the red actions carry the energy; the rest stays white, with a charcoal footer band that holds the HG mark and the org's sign-off.

## States (app.js, vanilla, no modules)
- **Tools:** search, category filter and a Tools/Consumables switch, with a live count. Out-of-stock items show "None available now" and a disabled button.
- **Reserve:** errors appear under each field when you submit. Student number format, quantity up to the stock, return date on or after pickup, and no return date for consumables. Success shows a ticket with a new `HYG-<year>-0151...` number saved in localStorage, plus a Track link.
- **Track:** three sample references, one per state (0137 Pending, 0142 Approved, 0129 Declined). Numbers made in this browser show as Pending. An unknown number shows an error under the field.
- **Join:** all brief fields, plus a **Preferred committee** select: Finance and Operations, Internal Affairs, Innovation and Research, External Affairs, Creative Media and Design.
- **Officer:** a sign-in card. Any email and password opens the dashboard; this is labelled as a prototype. The dashboard has a stat row, pending reservations with Approve/Decline (the cell turns into the decision badge), overdue items, item stock with OK/Low/Out, and new applications with Approve/Decline. All of it is labelled "Sample data".

## Skill deal (kept for the record)
- **Hero:** split, dealt after "film" and "photo" were dealt again because there is no film and no photo 1920px or wider.
- **Nav, close and footer:** nav-centre, close-photo, footer-visit. Footer-visit shows the district only, "Sta. Mesa, Manila", with a "See the area" map search.
- **Rhythm and buttons:** rhythm "space", arrow buttons.
- **Colour and type:** the palette comes from `start.mjs brand` with the client's own colours, and the pairing is Host Grotesk.
- **Moment and hero entrance (changed 2026-11-23):** the word-highlight moment and its ES-module kit were dropped so every page is plain CSS + one plain script. The hero words fade up once with a single CSS `@keyframes` (off under reduced motion).

## Code standard (2026-11-23)
- One `style.css`, mobile first, 19 numbered sections with short comments: variables, base, grid, header, buttons, hero, photos, cards, badges, ticket, rows, forms, catalog, dashboard, home sections, footer, then the 640px and 1024px media queries and reduced motion.
- Only hex variables, Flexbox, a 12-column Grid with `span-N` / `start-N` classes, media queries. No clamp(), min(), svh, :has(), oklch/color-mix, container queries or modules. `[hidden]{display:none !important}` is in the base.
- `app.js` is one plain script (no modules) with a commented section per page.
- `assets/moments/` is no longer used by any page; delete it.

## Checker (from the first build, before the 2026-11-23 update)
The finish gate ran 2 rounds on `index.html`, capped at two browser renders for this laptop.
- **Round 1:** 17 FAIL, all fixed. They covered a grid start/span bug, the hero visual, split lines, footer height, phone section heights, cut text, the 320px overflow, a repeated action and the first-screen fact.
- **Round 2:** `GATE: OPEN 2`. The two findings were a footer 37px over its bottom padding and two headings the checker said name no thing. Both were fixed after the gate (footer bottom padding set to the rhythm token; headings renamed "Hygears announcements" and "Posted from the officer dashboard"), but **not re-rendered**.
- **No waivers used.**
- **Copy-lint:** 0 FAIL on all 7 pages. One WARN stays: the exclamation mark in the tagline, which is the org's own words.
- **Not gated:** the gate only checks the home page. The six inner pages follow the professor's rules (page head, then content) rather than the skill's one-section-per-screen rule.

## Still needs real material
- The current logo: the flame-gradient HG mark. `img/hygears-logo.png` is the older red one.
- Photos of each item for the catalog. Every card shows a marked "Photo from Hygears" slot.
- The real stock list: items, categories and counts. The 12 items are the brief's sample list with made-up counts, labelled "Sample list".
- Real announcements. The home page shows 3 posts labelled as samples.
- The borrowing rules, which are marked "Draft" on About and Reserve. Also the pickup place and hours, which are not mentioned anywhere.
- The street address. Only "Sta. Mesa, Manila" is shown.
- A form endpoint and real officer login. In the PHP build, reference numbers will be made in MySQL, not in the browser.
- The org's domain, for canonical tags. `og:image` uses `img/team-luna.jpg` until a share image is made.
- Photos: the three provided photos are copied as compressed JPGs in `img/` (about 230 KB each, down from about 2 MB PNGs). They are 1440px wide, so the split hero shows them at about 1.1x.
