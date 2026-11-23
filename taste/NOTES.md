# Direction: Taste ("the ticket")

Built with the taste-skill (design-taste-frontend 2.5.1), kind **service** (site-kind other): real photographs, flat cream grounds, heavy type, no effects or 3D. Our professor's rules win wherever the skill disagrees.

## Pages
`index.html`, `tools.html`, `reserve.html`, `track.html`, `join.html`, `about.html`, `officer.html`. They share one `style.css`, one `app.js`, and the same header and footer. The nav marks the current page with an amber bar, and `reserve.html` lights up Tools. Every page opens by double-click.

## Palette (the org's 2026 brand, orange to red on cream)
| Role | Colour | Use |
|---|---|---|
| Primary / action | red `#D7261E` | Buttons and key actions only. White label 5.0:1. Hover `#B81E17` |
| Highlight | amber `#F5A623` | Current-page bar and the 3px flame stripe only, never behind text |
| Flame | orange `#F26A1B` | Only in the flame stripe at the top of the header |
| Ground | cream `#FFF4E2`, surface `#F7E6CC`, card `#FFFAF1` | Page, panels, cards |
| Text | brown-black `#2A140C` (16:1), muted `#6E5348` (6.4:1) | All text. Muted is for labels and meta only |

Status never relies on colour alone. Every status badge is an icon plus a word: clock Pending, check Approved, cross Declined, triangle Low or Due.

## Fonts (two)
- **Host Grotesk** (Google Fonts) for everything. Headings use weight 700 to match the heavy display type in the org's posts. h1 is 40 to 72px, h2 28 to 48px, h3 20px, the same on every page. Body text is 16px with line height 1.55.
- **System monospace** (Cascadia Mono or Consolas) for reference numbers only.
- If the page is opened offline, Host Grotesk falls back to the system sans.

## The one idea
**Every request becomes a ticket.** The reference number (`HYG-2026-0142`) is set large in mono on a card with a dashed tear line. The same ticket appears in the reserve success state, on the Track page and in the officer queue, so a student always knows which object they are holding. The flame stripe on the header and the heavy headings carry the brand's energy, while the rest of the page stays quiet cream.

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
- **Moment:** word-highlight, on the org's own tagline in the Join section of the home page.
- **Moment runtime:** the moment loads as an ES module from `assets/moments/` (unchanged kit files). Browsers block modules on `file://`, so when the page is opened by double-click the tagline simply shows in full ink. Over http (or the later PHP site) it lights up word by word.
- **Hero entrance:** done in `style.css`/`app.js`, not with the kit's `system.js`/`motion.js`. Those are ES modules too and would not run on double-click.

## Checker
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
